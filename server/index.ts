import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { 
  securityHeaders, 
  sanitizeInput, 
  securityLogger, 
  validateSession,
  apiLimiter 
} from "./middleware/security";

const PgSession = connectPgSimple(session);


async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    log("No DATABASE_URL, skipping migrations");
    return;
  }
  try {
    const { pool: migPool } = await import("./db");
    await migPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL DEFAULT '',
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        user_type TEXT NOT NULL DEFAULT 'customer',
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT DEFAULT '',
        location TEXT DEFAULT '',
        postcode TEXT DEFAULT '',
        profile_image TEXT,
        bio TEXT,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS tradie_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        trade_name TEXT NOT NULL,
        abn TEXT,
        description TEXT,
        hourly_rate TEXT,
        rating TEXT DEFAULT '0',
        total_reviews INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id) NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        location TEXT DEFAULT '',
        postcode TEXT DEFAULT '',
        budget_min TEXT DEFAULT '',
        budget_max TEXT DEFAULT '',
        timeline TEXT DEFAULT '',
        status TEXT DEFAULT 'open',
        images TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS job_quotes (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id),
        tradie_id INTEGER REFERENCES tradie_profiles(id),
        amount TEXT,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id),
        customer_id INTEGER REFERENCES users(id),
        tradie_id INTEGER REFERENCES tradie_profiles(id),
        rating INTEGER,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id),
        sender_id INTEGER REFERENCES users(id),
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'customer';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS postcode TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS accepted_by INTEGER REFERENCES tradie_profiles(id);
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
      ALTER TABLE jobs ALTER COLUMN status SET DEFAULT 'posted';
      ALTER TABLE job_quotes ADD COLUMN IF NOT EXISTS price DECIMAL(8,2);
      ALTER TABLE job_quotes ALTER COLUMN status SET DEFAULT 'pending';
    `);
    log("Database tables ready");
  } catch (error) {
    log(`Migration warning: ${error}`);
  }
}

const app = express();

// Trust proxy for accurate IP addresses behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: false
}));
app.use(securityHeaders);
app.use(securityLogger);
app.use(sanitizeInput);

// Session middleware
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: "session",
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || "tradieconnect-secret-key-2024",
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "none"
  }
}));

// Rate limiting for API endpoints
app.use('/api', apiLimiter);

app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await runMigrations();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Use NODE_ENV directly to determine if we should run Vite or serve static
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
