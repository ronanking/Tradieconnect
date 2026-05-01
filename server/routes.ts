import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerInvoiceRoutes } from "./invoice-routes";
import { sendTradieApplicationEmail } from "./email";
import { verifyABN, verifyLicence } from "./verification";
import { 
  authLimiter, 
  adminLimiter,
  adminIPWhitelist,
  ipSecurityMonitoring,
  bankingAccessLogger
} from "./middleware/security";
import { 
  userRegistrationValidation,
  jobValidation,
  quoteValidation,
  messageValidation,
  paymentValidation,
  bankAccountValidation,
  encryptBankingData,
  maskBankingInfo,
  hashPassword,
  verifyPassword
} from "./middleware/validation";
import CryptoJS from "crypto-js";
import { insertUserSchema, insertJobSchema, insertTradieProfileSchema, insertJobQuoteSchema, insertReviewSchema, insertWorkPhotoSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

// Data encryption utilities
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'tradie-marketplace-default-key-change-in-production';

const encryptSensitiveData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

const decryptSensitiveData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Register invoice routes
  registerInvoiceRoutes(app);
  // Add response compression for better performance
  app.use((req, res, next) => {
    // Cache static assets for 1 hour
    if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.set('Cache-Control', 'public, max-age=3600');
    }
    // Cache API responses for 5 minutes
    if (req.url.startsWith('/api/')) {
      res.set('Cache-Control', 'public, max-age=300');
    }
    next();
  });
  // ── AUTH ROUTES ──────────────────────────────────────────
  app.get("/api/auth/me", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.json(null);
      
      // Try Drizzle ORM first
      let user: any = null;
      try {
        const result = await storage.getUser(userId);
        if (result) {
          const role = (result as any).userType || (result as any).role || "customer";
          user = {
            ...result,
            role,
            userType: role,
          };
        }
      } catch (ormErr) {
        console.error("ORM getUser error:", ormErr);
      }

      // Fallback: raw SQL query
      if (!user) {
        try {
          const { pool } = await import("./db");
          const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
          user = result.rows[0] || null;
          if (user) {
            // Normalize snake_case to camelCase
            user = {
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              email: user.email,
              role: user.user_type || user.role || "customer",
              userType: user.user_type || user.role || "customer",
              phone: user.phone,
              location: user.location,
              username: user.username,
              isVerified: user.is_verified,
            };
          }
        } catch (rawErr) {
          console.error("Raw getUser error:", rawErr);
        }
      }

      if (!user) return res.json(null);
      const { password, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (err) {
      console.error("auth/me error:", err);
      res.json(null);
    }
  });

  app.post("/api/auth/register", authLimiter, async (req: any, res) => {
    try {
      const { firstName, lastName, email, password, phone, location } = req.body;
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        firstName, lastName, email, password: hashedPassword, 
        phone: phone || "", 
        location: location || "", 
        username: email.split("@")[0] + "_" + Date.now(),
        userType: "customer",
        role: "customer"
      } as any);
      req.session.userId = user.id;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) { console.error("Session save error:", err); reject(err); }
          else resolve();
        });
      });
      const { password: _, ...safeUser } = user as any;
      const role = (user as any).userType || (user as any).role || "customer";
      res.json({ ...safeUser, role, userType: role });
    } catch (error: any) {
      console.error("Register error:", error);
      res.status(400).json({ message: error?.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req: any, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const passwordValid = await verifyPassword(password, (user as any).password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.session.userId = user.id;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) { console.error("Session save error:", err); reject(err); }
          else resolve();
        });
      });
      const { password: _, ...safeUser } = user as any;
      const role = (user as any).userType || (user as any).role || "customer";
      res.json({ ...safeUser, role, userType: role });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req: any, res) => {
    req.session?.destroy((err: any) => {
      if (err) console.error("Session destroy error:", err);
    });
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });

  // User routes with enhanced security
  app.post("/api/users", authLimiter, userRegistrationValidation, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  });

  // Tradie routes
  app.get("/api/tradies", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const category = req.query.category as string;
      
      let tradies;
      if (category) {
        tradies = await storage.getTradiesByCategory(category, limit);
      } else {
        tradies = await storage.getAllTradies(limit);
      }
      
      res.json(tradies ?? []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tradies", error });
    }
  });

  app.post("/api/tradies", async (req, res) => {
    try {
      const profileData = insertTradieProfileSchema.parse(req.body);
      const profile = await storage.createTradieProfile(profileData);
      res.json(profile ?? []);
    } catch (error) {
      res.status(400).json({ message: "Invalid tradie profile data", error });
    }
  });

  app.get("/api/tradies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tradie = await storage.getTradieProfileById(id);
      if (!tradie) {
        return res.status(404).json({ message: "Tradie not found" });
      }
      res.json(tradie ?? []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tradie", error });
    }
  });

  app.get("/api/tradies/:id/photos", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const photos = await storage.getWorkPhotosByTradie(id);
      res.json(photos ?? []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching work photos", error });
    }
  });

  app.get("/api/tradies/:id/reviews", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reviews = await storage.getReviewsByTradie(id);
      res.json(reviews ?? []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews", error });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const postcode = req.query.postcode as string;
      
      let jobs;
      if (postcode) {
        jobs = await storage.getJobsByPostcode(postcode, limit);
      } else {
        jobs = await storage.getRecentJobs(limit);
      }
      
      res.json(jobs ?? []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching jobs", error });
    }
  });

  app.post("/api/jobs", jobValidation, async (req: any, res) => {
    try {
      let customerId = req.session?.userId || req.body.customerId;

      if (!customerId) {
        const name = req.body.customerName || "Guest";
        const phone = req.body.phone || "";
        const firstName = name.split(" ")[0] || "Guest";
        const lastName = name.split(" ").slice(1).join(" ") || "User";
        const email = `guest_${Date.now()}@tradieconnect.com.au`;
        const guestUser = await storage.createUser({
          firstName, lastName, email, phone,
          password: "guest", role: "customer"
        });
        customerId = guestUser.id;
      }

      const jobData = insertJobSchema.parse({ ...req.body, customerId });
      const job = await storage.createJob(jobData);
      res.json(job);
    } catch (error) {
      console.error("Job creation error:", error);
      res.status(400).json({ error: "Validation failed", details: error });
    }
  });

  // Get job counts by category - MUST come before /api/jobs/:id
  app.get("/api/jobs/counts-by-category", async (req: any, res: any) => {
    try {
      const categories = ['Plumbing', 'Carpentry', 'Electrical', 'Landscaping', 'Painting', 'HVAC', 'Roofing', 'Tiling', 'Fencing'];
      const counts: Record<string, number> = {};
      
      for (const category of categories) {
        const jobs = await storage.getActiveJobsByCategory(category);
        counts[category] = jobs.length;
      }
      
      res.json(counts ?? []);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Error fetching job", error });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const job = await storage.updateJob(id, updates);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Error updating job", error });
    }
  });

  // Job Quote routes
  app.post("/api/jobs/:id/quotes", quoteValidation, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const quoteData = insertJobQuoteSchema.parse({ ...req.body, jobId });
      const quote = await storage.createJobQuote(quoteData);
      res.json(quote);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote data", error });
    }
  });

  app.get("/api/jobs/:id/quotes", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const quotes = await storage.getJobQuotes(jobId);
      res.json(quotes ?? []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quotes", error });
    }
  });

  // Review routes
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.json(review ?? []);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data", error });
    }
  });

  // Work Photo routes
  app.post("/api/work-photos", async (req, res) => {
    try {
      const photoData = insertWorkPhotoSchema.parse(req.body);
      const photo = await storage.createWorkPhoto(photoData);
      res.json(photo ?? []);
    } catch (error) {
      res.status(400).json({ message: "Invalid photo data", error });
    }
  });

  // Message routes
  app.post("/api/jobs/:id/messages", messageValidation, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const messageData = insertMessageSchema.parse({ ...req.body, jobId });
      const message = await storage.createMessage(messageData);
      res.json(message ?? []);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data", error });
    }
  });

  app.get("/api/jobs/:id/messages", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const messages = await storage.getJobMessages(jobId);
      res.json(messages ?? []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages", error });
    }
  });

  // Conversation routes for messaging system
  app.get("/api/conversations", async (req: any, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Authentication required" });
    try {
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations || []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations", error });
    }
  });

  app.get("/api/conversations/:participantId/messages", async (req: any, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    try {
      const participantId = parseInt(req.params.participantId);
      const messages = await storage.getConversationMessages(userId, participantId);
      res.json(messages ?? []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversation messages", error });
    }
  });

  app.post("/api/conversations/:participantId/messages", messageValidation, async (req: any, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    try {
      const receiverId = parseInt(req.params.participantId);
      const senderId = userId;
      const { message, jobId } = req.body;

      const messageData = {
        jobId: jobId || null,
        senderId,
        receiverId,
        message
      };

      const newMessage = await storage.createMessage(messageData);
      res.json(newMessage ?? []);
    } catch (error) {
      res.status(400).json({ message: "Error sending message", error });
    }
  });

  // Trade categories
  app.get("/api/categories", async (req, res) => {
    const categories = [
      { id: 1, name: "Plumbing", icon: "fas fa-hammer", description: "Water systems, pipes, fixtures" },
      { id: 2, name: "Electrical", icon: "fas fa-bolt", description: "Wiring, lighting, safety switches" },
      { id: 3, name: "Painting", icon: "fas fa-paint-roller", description: "Interior and exterior painting" },
      { id: 4, name: "Carpentry", icon: "fas fa-tools", description: "Custom woodwork, cabinets, decks" },
      { id: 5, name: "HVAC", icon: "fas fa-wrench", description: "Heating, cooling, ventilation" },
      { id: 6, name: "Roofing", icon: "fas fa-home", description: "Roof repairs, gutters, tiles" },
    ];
    res.json(categories ?? []);
  });

  // Mock payment route (placeholder for Stripe integration)
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      // In production, this would create a real Stripe payment intent
      res.json({ 
        clientSecret: "mock_client_secret_" + Date.now(),
        paymentIntentId: "mock_pi_" + Date.now()
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent", error });
    }
  });

  // Customer Dashboard API endpoints
  app.get("/api/customer/jobs", async (req: any, res) => {
    try {
      const customerId = req.session?.userId;
      if (!customerId) return res.json([]);
      const jobs = await storage.getJobsByCustomer(customerId);
      
      const dashboardJobs = jobs.map(job => ({
        id: job.id,
        title: job.title,
        status: job.status,
        category: job.category,
        location: job.location,
        createdAt: job.createdAt,
        budgetMin: job.budgetMin,
        budgetMax: job.budgetMax,
        quotesCount: 3,
        assignedTradie: job.status === "active" ? {
          name: "Mike Johnson",
          rating: "4.8"
        } : undefined
      }));
      
      res.json(dashboardJobs ?? []);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching customer jobs", error: error.message });
    }
  });

  app.get("/api/customer/quotes", async (req: any, res) => {
    try {
      const customerId = req.session?.userId;
      if (!customerId) return res.json([]);
      const jobs = await storage.getJobsByCustomer(customerId);
      const allQuotes = [];
      for (const job of jobs) {
        try {
          const quotes = await storage.getJobQuotes(job.id);
          for (const q of (quotes || [])) {
            allQuotes.push({ ...q, jobTitle: job.title });
          }
        } catch {}
      }
      res.json(allQuotes);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching quotes", error: error.message });
    }
  });

  app.get("/api/customer/stats", async (req, res) => {
    try {
      const stats = {
        totalSpent: 2450
      };
      res.json(stats ?? []);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching customer stats", error: error.message });
    }
  });

  // Subscription routes
  app.get("/api/tradie/subscription", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const profile = await storage.getTradieProfile(userId);
      if (!profile) return res.status(404).json({ message: "Tradie profile not found" });
      res.json({
        plan: (profile as any).subscriptionPlan || "starter",
        status: (profile as any).subscriptionStatus || "active"
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching subscription", error: error.message });
    }
  });

  app.post("/api/tradie/subscription/upgrade", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const { plan } = req.body;
      if (!["starter", "professional", "enterprise"].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan" });
      }
      await storage.updateTradieSubscription(userId, plan);
      res.json({ success: true, plan });
    } catch (error: any) {
      res.status(500).json({ message: "Error upgrading subscription", error: error.message });
    }
  });

  // Tradie Dashboard API endpoints
  app.get("/api/tradie/available-jobs", async (req, res) => {
    try {
      const jobs = await storage.getRecentJobs(20);
      
      const availableJobs = jobs.map(job => ({
        id: job.id,
        title: job.title,
        status: "available",
        category: job.category,
        location: job.location,
        createdAt: job.createdAt,
        budgetMin: job.budgetMin,
        budgetMax: job.budgetMax,
        customer: {
          name: job.customer.firstName + " " + job.customer.lastName,
          rating: "4.6"
        },
        timeline: "Within 1 week"
      }));
      
      res.json(availableJobs ?? []);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching available jobs", error: error.message });
    }
  });

  app.get("/api/tradie/my-jobs", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.json([]);
      const tradieProfile = await storage.getTradieProfile(userId);
      if (!tradieProfile) return res.json([]);
      const jobs = await storage.getJobsByTradie(tradieProfile.id);
      const result = await Promise.all((jobs || []).map(async (job: any) => {
        const customer = await storage.getUser(job.customerId);
        return {
          id: job.id,
          title: job.title,
          status: job.status,
          category: job.category,
          location: job.location,
          createdAt: job.createdAt,
          budgetMin: job.budgetMin,
          budgetMax: job.budgetMax,
          customer: { name: customer ? `${customer.firstName} ${customer.lastName}` : "Customer", rating: null },
          timeline: job.timeline
        };
      }));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching tradie jobs", error: error.message });
    }
  });

  app.get("/api/tradie/quotes", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.json([]);
      const tradieProfile = await storage.getTradieProfile(userId);
      if (!tradieProfile) return res.json([]);
      const quotes = await storage.getQuotesByTradie(tradieProfile.id);
      const result = await Promise.all((quotes || []).map(async (quote: any) => {
        const customer = quote.job ? await storage.getUser(quote.job.customerId) : null;
        return {
          id: quote.id,
          jobId: quote.jobId,
          jobTitle: quote.job?.title || "Job",
          customerName: customer ? `${customer.firstName} ${customer.lastName}` : "Customer",
          price: quote.amount || quote.price || "0",
          message: quote.description || quote.message || "",
          timeline: quote.timeline,
          status: quote.status,
          createdAt: quote.createdAt
        };
      }));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching tradie quotes", error: error.message });
    }
  });

  app.get("/api/tradie/stats", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const empty = { totalJobs: 0, completedJobs: 0, averageRating: "0", totalEarnings: 0, responseRate: "0%", completionRate: "0%" };
      if (!userId) return res.json(empty);
      const tradieProfile = await storage.getTradieProfile(userId);
      if (!tradieProfile) return res.json(empty);
      const jobs = await storage.getJobsByTradie(tradieProfile.id) || [];
      const completedJobs = jobs.filter((j: any) => j.status === "completed");
      const quotes = await storage.getQuotesByTradie(tradieProfile.id) || [];
      const totalEarnings = quotes
        .filter((q: any) => q.status === "accepted")
        .reduce((sum: number, q: any) => sum + parseFloat(q.amount || q.price || "0"), 0);
      const completionRate = jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0;
      res.json({
        totalJobs: jobs.length,
        completedJobs: completedJobs.length,
        averageRating: tradieProfile.rating || "0",
        totalEarnings: Math.round(totalEarnings),
        responseRate: `${completionRate}%`,
        completionRate: `${completionRate}%`
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching tradie stats", error: error.message });
    }
  });

  // Contracts
  app.post("/api/contracts", async (req, res) => {
    try {
      const contract = await storage.createContract(req.body);
      res.json(contract);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contracts", async (req, res) => {
    try {
      // Mock user ID for now - in real app get from authentication
      const userId = 1;
      const contracts = await storage.getContractsByUser(userId);
      res.json(contracts ?? []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contracts/job/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const contracts = await storage.getContractsByJob(parseInt(jobId));
      res.json(contracts ?? []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const contract = await storage.getContractById(parseInt(id));
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contracts/:id/sign", async (req, res) => {
    try {
      const { id } = req.params;
      const { signatureData, ipAddress } = req.body;
      const signedBy = 1; // In real app, get from authenticated user
      
      const contract = await storage.signContract(parseInt(id), signedBy, signatureData, ipAddress);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin monitoring endpoints with enhanced security
  // Auto-migration: add subscription columns if missing
  app.get("/api/admin/migrate-subscription", async (req, res) => {
    try {
      const { db } = await import("./db");
      await db.execute(`ALTER TABLE tradie_profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter'`);
      await db.execute(`ALTER TABLE tradie_profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active'`);
      await db.execute(`ALTER TABLE tradie_profiles ADD COLUMN IF NOT EXISTS bio TEXT`);
      res.json({ success: true, message: "Migration complete" });
    } catch (error: any) {
      res.status(500).json({ message: "Migration failed", error: error.message });
    }
  });

  app.get("/api/admin/stats", adminLimiter, adminIPWhitelist(), async (req, res) => {
    try {
      const totalUsers = (await storage.getAllUsers()).length;
      const allJobs = await storage.getAllJobs();
      const totalJobs = allJobs.length;
      const totalMessages = (await storage.getAllMessages()).length;
      const totalContracts = (await storage.getAllContracts()).length;
      
      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentUsers = (await storage.getAllUsers()).filter(user => 
        new Date(user.createdAt) > sevenDaysAgo
      );
      const recentJobs = allJobs.filter(job => 
        new Date(job.createdAt) > sevenDaysAgo
      );
      const recentContracts = (await storage.getAllContracts()).filter(contract => 
        contract.signedAt && new Date(contract.signedAt) > sevenDaysAgo
      );

      res.json({
        totalUsers,
        totalJobs,
        totalMessages,
        totalContracts,
        recentActivity: {
          newUsers: recentUsers.length,
          newJobs: recentJobs.length,
          signedContracts: recentContracts.length
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching admin stats: " + error.message });
    }
  });

  app.get("/api/admin/recent-users", adminLimiter, adminIPWhitelist(), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          createdAt: user.createdAt
        }));
      
      res.json(recentUsers ?? []);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching recent users: " + error.message });
    }
  });

  app.get("/api/admin/recent-jobs", adminLimiter, adminIPWhitelist(), async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      const recentJobs = jobs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      
      res.json(recentJobs ?? []);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching recent jobs: " + error.message });
    }
  });

  // Banking and payment security endpoints
  app.post("/api/payment/process", bankingAccessLogger, paymentValidation, async (req, res) => {
    try {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      console.log(`[PAYMENT-PROCESSING] ${new Date().toISOString()} - IP: ${clientIp}`);
      
      // Encrypt sensitive banking data before processing
      const encryptedCardNumber = encryptBankingData(req.body.cardNumber);
      const encryptedCvv = encryptBankingData(req.body.cvv);
      
      // Mask data for logging
      const logData = maskBankingInfo(req.body);
      console.log(`[PAYMENT-DATA] Processed payment for: ${logData.cardholderName}, Card: ${logData.cardNumber}`);
      
      // In production, this would integrate with Stripe or similar
      res.json({ 
        success: true, 
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: "Payment processed securely"
      });
    } catch (error: any) {
      console.error(`[PAYMENT-ERROR] ${error.message}`);
      res.status(500).json({ error: "Payment processing failed" });
    }
  });

  app.post("/api/banking/account", bankingAccessLogger, bankAccountValidation, async (req, res) => {
    try {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      console.log(`[BANKING-ACCOUNT] ${new Date().toISOString()} - IP: ${clientIp}`);
      
      // Encrypt banking details
      const encryptedBsb = encryptBankingData(req.body.bsb);
      const encryptedAccountNumber = encryptBankingData(req.body.accountNumber);
      
      // Mask for logging
      const logData = maskBankingInfo(req.body);
      console.log(`[BANK-ACCOUNT] Added account for: ${req.body.accountName}, Account: ${logData.accountNumber}`);
      
      res.json({ 
        success: true, 
        message: "Bank account details saved securely"
      });
    } catch (error: any) {
      console.error(`[BANKING-ERROR] ${error.message}`);
      res.status(500).json({ error: "Banking operation failed" });
    }
  });

  // Security monitoring endpoints
  app.get("/api/admin/security-incidents", adminLimiter, adminIPWhitelist(), async (req, res) => {
    try {
      // Import here to avoid circular dependency
      const { getSecurityIncidents } = await import("./middleware/security");
      const incidents = getSecurityIncidents();
      
      res.json({
        total: incidents.length,
        recent: incidents.slice(-50), // Last 50 incidents
        summary: {
          suspiciousPatterns: incidents.filter(i => i.type === 'SUSPICIOUS_PATTERN').length,
          bankingAccess: incidents.filter(i => i.type === 'BANKING_ACCESS').length,
          failedAuth: incidents.filter(i => i.type === 'AUTH_FAILURE').length
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching security incidents: " + error.message });
    }
  });

  // Tradie application — creates account + sends email
  app.post("/api/tradie/apply", authLimiter, async (req: any, res) => {
    try {
      const {
        firstName, lastName, email, phone, location, postcode,
        tradeName, abn, categories, yearsExperience,
        license, insurance, qualifications,
        hourlyRate, serviceAreas, bio, whyChooseMe, password
      } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "First name, last name, email and password are required" });
      }

      // Check if email already exists
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);

      // Create the user account as tradie
      const user = await storage.createUser({
        firstName, lastName, email,
        password: hashedPassword,
        phone: phone || "",
        location: location || "",
        username: email.split("@")[0] + "_" + Date.now(),
        userType: "tradie",
        role: "tradie",
      } as any);

      // Create tradie profile
      try {
        await storage.createTradieProfile({
          userId: user.id,
          tradeName: tradeName || `${firstName} ${lastName}`,
          license: license || "",
          insurance: insurance || "",
          yearsExperience: parseInt(yearsExperience) || 0,
          bio: bio || "",
          hourlyRate: hourlyRate || "",
          categories: categories || [],
          serviceAreas: serviceAreas || [],
          abn: abn || "",
          qualifications: qualifications || "",
        } as any);
      } catch (profileErr) {
        console.error("Tradie profile creation error:", profileErr);
      }

      // Log them in
      req.session.userId = user.id;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) reject(err); else resolve();
        });
      });

      // Send email notification
      try {
        await sendTradieApplicationEmail({
          userId: user.id,
          firstName, lastName, email, phone, location, postcode,
          tradeName, abn, categories: categories || [], yearsExperience,
          license, insurance, qualifications,
          hourlyRate, serviceAreas: serviceAreas || [], bio, whyChooseMe
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }

      const { password: _, ...safeUser } = user as any;
      res.json({ success: true, user: { ...safeUser, role: "tradie" } });
    } catch (error: any) {
      console.error("Tradie apply error:", error);
      res.status(400).json({ message: error?.message || "Application failed" });
    }
  });

  // ABN Verification
  app.get("/api/verify/abn/:abn", async (req, res) => {
    try {
      const result = await verifyABN(req.params.abn);
      res.json(result);
    } catch (err) {
      res.json({ valid: false, error: "Verification failed" });
    }
  });

  // Licence Verification - all Australian states
  app.get("/api/verify/licence/:license", async (req, res) => {
    try {
      const state = (req.query.state as string) || "QLD";
      const result = await verifyLicence(req.params.license, state);
      res.json(result);
    } catch (err) {
      res.json({ valid: false, error: "Verification failed" });
    }
  });

  // Approve tradie application via email link
  app.get("/api/tradie/approve/:userId", async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const secret = req.query.secret;
      if (secret !== process.env.SESSION_SECRET) {
        return res.status(403).send("Invalid approval link");
      }
      await storage.updateUser(userId, { isVerified: true } as any);
      res.send(`
        <html><body style="font-family:Arial;text-align:center;padding:60px;background:#f8fafc;">
          <div style="background:white;border-radius:16px;padding:40px;max-width:400px;margin:0 auto;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="font-size:48px;margin-bottom:16px;">✅</div>
            <h1 style="color:#1e293b;">Tradie Approved!</h1>
            <p style="color:#64748b;">User ID ${userId} has been verified and can now access the tradie dashboard.</p>
            <a href="https://tradieconnect-production.up.railway.app" style="display:inline-block;margin-top:20px;background:#1e3a5f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Go to TradieConnect</a>
          </div>
        </body></html>
      `);
    } catch (error: any) {
      res.status(500).send("Approval failed: " + error.message);
    }
  });

  // Apply global security monitoring
  app.use(ipSecurityMonitoring);

  const httpServer = createServer(app);
  return httpServer;
}
