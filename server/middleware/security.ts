import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

// Rate limiting middleware to prevent brute force attacks
export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    // Store rate limit info in memory (use Redis for production)
    store: undefined
  });
};

// General API rate limiting
export const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  "Too many requests from this IP, please try again later"
);

// Strict rate limiting for authentication endpoints
export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  50, // limit each IP to 50 requests per windowMs
  "Too many authentication attempts, please try again later"
);

// Admin endpoints rate limiting
export const adminLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  10, // limit each IP to 10 requests per windowMs
  "Admin endpoints access limited, please try again later"
);

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove potentially dangerous characters from all string inputs
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// IP address security monitoring
export const ipSecurityMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const timestamp = new Date().toISOString();
  
  // Log all requests with IP and user agent for security monitoring
  console.log(`[IP-SECURITY] ${timestamp} - IP: ${clientIp}, Agent: ${userAgent}, Path: ${req.path}, Method: ${req.method}`);
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//,  // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /base64_decode/i, // Code injection
    /eval\(/i, // JavaScript injection
  ];
  
  const requestData = JSON.stringify({
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      console.warn(`[SECURITY-ALERT] ${timestamp} - Suspicious pattern detected from IP: ${clientIp}, Pattern: ${pattern.toString()}, Data: ${requestData.substring(0, 200)}`);
      
      // Log security incident
      logSecurityIncident({
        type: 'SUSPICIOUS_PATTERN',
        ip: clientIp,
        userAgent: userAgent,
        timestamp: timestamp,
        pattern: pattern.toString(),
        requestData: requestData.substring(0, 500)
      });
      
      break;
    }
  }
  
  // Add IP to request for downstream middleware
  req.clientIp = clientIp;
  next();
};

// Banking data access logging
export const bankingAccessLogger = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const timestamp = new Date().toISOString();
  
  console.log(`[BANKING-ACCESS] ${timestamp} - IP: ${clientIp}, Path: ${req.path}, Method: ${req.method}`);
  
  // Log any access to banking-related endpoints
  logSecurityIncident({
    type: 'BANKING_ACCESS',
    ip: clientIp,
    userAgent: req.get('User-Agent') || 'unknown',
    timestamp: timestamp,
    endpoint: req.path,
    method: req.method
  });
  
  next();
};

// Security incident logging
const securityIncidents: any[] = [];

const logSecurityIncident = (incident: any) => {
  securityIncidents.push(incident);
  
  // Keep only last 1000 incidents in memory
  if (securityIncidents.length > 1000) {
    securityIncidents.shift();
  }
  
  // In production, this should be sent to a proper logging service
  console.log(`[SECURITY-INCIDENT] ${JSON.stringify(incident)}`);
};

export const getSecurityIncidents = () => securityIncidents;

// Geographic IP checking (basic implementation)
export const geoIPCheck = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  
  // List of countries with known high fraud rates (basic implementation)
  const suspiciousCountryCodes = process.env.SUSPICIOUS_COUNTRIES?.split(',') || [];
  
  // In production, use a proper GeoIP service like MaxMind
  // For now, we'll just log the IP for monitoring
  console.log(`[GEO-IP] Request from IP: ${clientIp}`);
  
  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  const isDev = process.env.NODE_ENV !== 'production';

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (isDev) {
    // In development, allow all framing and external sources so Replit preview works
    res.setHeader('Content-Security-Policy',
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
      "frame-ancestors *"
    );
  } else {
    // Production: strict CSP
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com; " +
      "connect-src 'self' wss: ws:; " +
      "frame-ancestors 'self'"
    );
    res.setHeader('Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );
  }

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

// Request logging for security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /(\.\.\/)|(\.\.\\)/g, // Path traversal
    /<script|javascript:|on\w+=/gi, // XSS attempts
    /union.*select|select.*from|insert.*into|delete.*from/gi, // SQL injection
    /eval\(|exec\(|system\(/gi, // Code injection
  ];

  const userAgent = req.get('User-Agent') || '';
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || 
    pattern.test(JSON.stringify(req.body)) || 
    pattern.test(JSON.stringify(req.query))
  );

  if (isSuspicious) {
    console.warn(`🚨 SECURITY ALERT: Suspicious request detected`, {
      ip: req.ip,
      method: req.method,
      url: req.url,
      userAgent,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log failed authentication attempts
    if (req.path.includes('/auth') && res.statusCode >= 400) {
      console.warn(`🔐 AUTH FAILURE: ${req.method} ${req.path}`, {
        ip: req.ip,
        statusCode: res.statusCode,
        duration,
        userAgent,
        timestamp: new Date().toISOString()
      });
    }

    // Log admin access attempts
    if (req.path.includes('/admin')) {
      console.info(`👤 ADMIN ACCESS: ${req.method} ${req.path}`, {
        ip: req.ip,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
};

// IP whitelist for admin endpoints (optional)
export const adminIPWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (allowedIPs.length === 0) {
      // If no whitelist specified, allow all (for development)
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    if (!allowedIPs.includes(clientIP)) {
      console.warn(`🚫 ADMIN ACCESS DENIED: IP ${clientIP} not in whitelist`);
      return res.status(403).json({ 
        error: 'Access denied: IP not authorized for admin access' 
      });
    }

    next();
  };
};

// Session security validation
export const validateSession = (req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    // Check session age (expire after 24 hours)
    const sessionAge = Date.now() - (req.session.createdAt || 0);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) {
      req.session.destroy((err) => {
        if (err) console.error('Session destruction error:', err);
      });
      return res.status(401).json({ error: 'Session expired' });
    }

    // Regenerate session ID periodically (every hour)
    const regenInterval = 60 * 60 * 1000; // 1 hour
    if (sessionAge > 0 && sessionAge % regenInterval < 1000) {
      req.session.regenerate((err) => {
        if (err) console.error('Session regeneration error:', err);
        next();
      });
    } else {
      next();
    }
  } else {
    next();
  }
};
// Admin email check - only ronanking41875@gmail.com can access admin routes
export const requireAdmin = async (req: any, res: Response, next: NextFunction) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const { pool } = await import("../db");
    // Ensure role column exists and admin is set
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`);
      await pool.query(`UPDATE users SET role = 'admin' WHERE email = 'ronanking41875@gmail.com'`);
    } catch (_) {}
    const result = await pool.query("SELECT email, role FROM users WHERE id = $1", [userId]);
    const user = result.rows[0];
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }
    // Allow if email matches OR role is admin
    if (user.email === 'ronanking41875@gmail.com' || user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
  } catch (err) {
    console.error('requireAdmin error:', err);
    return res.status(500).json({ error: 'Auth check failed' });
  }
};
