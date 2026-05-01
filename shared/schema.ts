import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(), // 'customer' | 'tradie'
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  location: text("location"), // suburb, state, postcode
  postcode: text("postcode"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tradeCategories = pgTable("trade_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description"),
});

export const tradieProfiles = pgTable("tradie_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tradeName: text("trade_name").notNull(),
  license: text("license"),
  insurance: text("insurance"),
  yearsExperience: integer("years_experience"),
  servicesOffered: text("services_offered").array(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  totalJobs: integer("total_jobs").default(0),
  responseTime: text("response_time"), // e.g. "2hr", "1 day"
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  subscriptionPlan: text("subscription_plan").default("starter"), // 'starter', 'professional', 'enterprise'
  subscriptionStatus: text("subscription_status").default("active"), // 'active', 'cancelled', 'expired'
  bio: text("bio"),
});

export const workPhotos = pgTable("work_photos", {
  id: serial("id").primaryKey(),
  tradieId: integer("tradie_id").references(() => tradieProfiles.id).notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  jobCategory: text("job_category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  postcode: text("postcode").notNull(),
  budgetMin: decimal("budget_min", { precision: 8, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 8, scale: 2 }),
  timeline: text("timeline").notNull(), // 'ASAP', 'This week', etc.
  status: text("status").notNull().default("posted"), // 'posted', 'accepted', 'in_progress', 'completed', 'cancelled'
  acceptedBy: integer("accepted_by").references(() => tradieProfiles.id),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const jobQuotes = pgTable("job_quotes", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  tradieId: integer("tradie_id").references(() => tradieProfiles.id).notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  message: text("message"),
  timeline: text("timeline"),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  tradieId: integer("tradie_id").references(() => tradieProfiles.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoicing System - replaces payment processing
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  quoteId: integer("quote_id").references(() => jobQuotes.id),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  tradieId: integer("tradie_id").references(() => tradieProfiles.id).notNull(),
  
  // Invoice Details
  subtotal: decimal("subtotal", { precision: 8, scale: 2 }).notNull(),
  gstAmount: decimal("gst_amount", { precision: 8, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 8, scale: 2 }).notNull(),
  
  // Invoice Content
  description: text("description").notNull(),
  lineItems: jsonb("line_items"), // Array of {description, quantity, rate, amount}
  notes: text("notes"),
  
  // Payment Information
  paymentTerms: text("payment_terms").default("Net 30"), // "Net 7", "Net 14", "Net 30", "Due on receipt"
  paymentMethods: text("payment_methods").array(), // ["bank_transfer", "cash", "cheque", "paypal"]
  bankDetails: jsonb("bank_details"), // {bsb, accountNumber, accountName, reference}
  
  // Status and Dates
  status: text("status").notNull().default("draft"), // 'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  quoteId: integer("quote_id").references(() => jobQuotes.id).notNull(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  tradieId: integer("tradie_id").references(() => tradieProfiles.id).notNull(),
  contractType: text("contract_type").notNull(), // "customer" or "tradie"
  contractTemplate: text("contract_template").notNull(),
  contractTerms: text("contract_terms").notNull(),
  signedBy: integer("signed_by").references(() => users.id),
  signedAt: timestamp("signed_at"),
  signatureData: text("signature_data"), // Base64 encoded signature image
  ipAddress: text("ip_address"),
  status: text("status").notNull().default("pending"), // pending, signed, expired
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tradie Banking Information (encrypted storage)
export const tradieBankAccounts = pgTable("tradie_bank_accounts", {
  id: serial("id").primaryKey(),
  tradieId: integer("tradie_id").references(() => tradieProfiles.id).notNull().unique(),
  // Encrypted banking details
  accountHolderName: text("account_holder_name").notNull(),
  bsb: text("bsb").notNull(), // Australian Bank State Branch
  accountNumber: text("account_number").notNull(), // Encrypted
  bankName: text("bank_name").notNull(),
  accountType: text("account_type").notNull(), // 'savings' | 'cheque'
  isVerified: boolean("is_verified").default(false),
  verificationDate: timestamp("verification_date"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment Transactions 
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  quoteId: integer("quote_id").references(() => jobQuotes.id).notNull(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  tradieId: integer("tradie_id").references(() => tradieProfiles.id).notNull(),
  // Payment amounts
  totalAmount: decimal("total_amount", { precision: 8, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 8, scale: 2 }).notNull(),
  tradieAmount: decimal("tradie_amount", { precision: 8, scale: 2 }).notNull(),
  // Payment processing
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeTransferId: text("stripe_transfer_id"),
  paymentMethod: text("payment_method").notNull(), // 'credit_card' | 'bank_transfer'
  status: text("status").notNull().default("pending"), // 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  paymentDate: timestamp("payment_date"),
  transferDate: timestamp("transfer_date"),
  failureReason: text("failure_reason"),
  refundReason: text("refund_reason"),
  refundAmount: decimal("refund_amount", { precision: 8, scale: 2 }),
  metadata: jsonb("metadata"), // Additional payment details
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Disputes
export const paymentDisputes = pgTable("payment_disputes", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => paymentTransactions.id).notNull(),
  initiatedBy: integer("initiated_by").references(() => users.id).notNull(),
  disputeType: text("dispute_type").notNull(), // 'quality' | 'non_completion' | 'overcharge' | 'other'
  description: text("description").notNull(),
  evidence: text("evidence").array(), // URLs to uploaded evidence
  status: text("status").notNull().default("open"), // 'open' | 'investigating' | 'resolved' | 'closed'
  resolution: text("resolution"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform Earnings (for business tracking)
export const platformEarnings = pgTable("platform_earnings", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => paymentTransactions.id).notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  feeType: text("fee_type").notNull(), // 'platform_fee' | 'payment_processing'
  date: timestamp("date").defaultNow(),
  month: text("month").notNull(), // YYYY-MM for reporting
  year: text("year").notNull(), // YYYY for reporting
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTradieProfileSchema = createInsertSchema(tradieProfiles).omit({
  id: true,
  rating: true,
  totalReviews: true,
  totalJobs: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  status: true,
  acceptedBy: true,
  createdAt: true,
  completedAt: true,
});

export const insertJobQuoteSchema = createInsertSchema(jobQuotes).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertWorkPhotoSchema = createInsertSchema(workPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  invoiceNumber: true,
  status: true,
  sentAt: true,
  viewedAt: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradieBankAccountSchema = createInsertSchema(tradieBankAccounts).omit({
  id: true,
  isVerified: true,
  verificationDate: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  status: true,
  paymentDate: true,
  transferDate: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentDisputeSchema = createInsertSchema(paymentDisputes).omit({
  id: true,
  status: true,
  resolvedBy: true,
  resolvedAt: true,
  createdAt: true,
});

export const insertPlatformEarningsSchema = createInsertSchema(platformEarnings).omit({
  id: true,
  date: true,
});

// Payment scheduling tables
export const paymentSchedules = pgTable("payment_schedules", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").references(() => jobQuotes.id).notNull(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  tradieId: integer("tradie_id").references(() => tradieProfiles.id).notNull(),
  totalAmount: decimal("total_amount", { precision: 8, scale: 2 }).notNull(),
  numberOfPayments: integer("number_of_payments").notNull(),
  frequency: text("frequency").notNull(), // 'weekly', 'bi-weekly', 'monthly'
  startDate: timestamp("start_date").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'active', 'completed', 'cancelled'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scheduledPayments = pgTable("scheduled_payments", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").references(() => paymentSchedules.id).notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'paid', 'failed', 'cancelled'
  paidAt: timestamp("paid_at"),
  paymentMethod: text("payment_method"), // 'credit_card', 'bank_transfer', etc.
  transactionId: text("transaction_id"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentScheduleSchema = createInsertSchema(paymentSchedules).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduledPaymentSchema = createInsertSchema(scheduledPayments).omit({
  id: true,
  status: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TradieProfile = typeof tradieProfiles.$inferSelect;
export type InsertTradieProfile = z.infer<typeof insertTradieProfileSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type JobQuote = typeof jobQuotes.$inferSelect;
export type InsertJobQuote = z.infer<typeof insertJobQuoteSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type WorkPhoto = typeof workPhotos.$inferSelect;
export type InsertWorkPhoto = z.infer<typeof insertWorkPhotoSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type TradieBankAccount = typeof tradieBankAccounts.$inferSelect;
export type InsertTradieBankAccount = z.infer<typeof insertTradieBankAccountSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentDispute = typeof paymentDisputes.$inferSelect;
export type InsertPaymentDispute = z.infer<typeof insertPaymentDisputeSchema>;
export type PlatformEarnings = typeof platformEarnings.$inferSelect;
export type InsertPlatformEarnings = z.infer<typeof insertPlatformEarningsSchema>;
export type PaymentSchedule = typeof paymentSchedules.$inferSelect;
export type InsertPaymentSchedule = z.infer<typeof insertPaymentScheduleSchema>;
export type ScheduledPayment = typeof scheduledPayments.$inferSelect;
export type InsertScheduledPayment = z.infer<typeof insertScheduledPaymentSchema>;
