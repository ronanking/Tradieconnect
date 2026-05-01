import { 
  users, tradieProfiles, jobs, jobQuotes, reviews, workPhotos, messages, invoices, contracts,
  tradieBankAccounts, paymentTransactions, paymentDisputes, platformEarnings,
  paymentSchedules, scheduledPayments,
  type User, type InsertUser, type TradieProfile, type InsertTradieProfile,
  type Job, type InsertJob, type JobQuote, type InsertJobQuote,
  type Review, type InsertReview, type WorkPhoto, type InsertWorkPhoto,
  type Message, type InsertMessage, type Invoice, type InsertInvoice, type Contract, type InsertContract,
  type TradieBankAccount, type InsertTradieBankAccount,
  type PaymentTransaction, type InsertPaymentTransaction,
  type PaymentDispute, type InsertPaymentDispute,
  type PlatformEarnings, type InsertPlatformEarnings,
  type PaymentSchedule, type InsertPaymentSchedule,
  type ScheduledPayment, type InsertScheduledPayment
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tradie Profiles
  getTradieProfile(userId: number): Promise<TradieProfile | undefined>;
  getTradieProfileById(id: number): Promise<TradieProfile | undefined>;
  createTradieProfile(profile: InsertTradieProfile): Promise<TradieProfile>;
  updateTradieProfile(id: number, updates: Partial<TradieProfile>): Promise<TradieProfile | undefined>;
  updateTradieSubscription(userId: number, plan: string): Promise<void>;
  getAllTradies(limit?: number): Promise<(TradieProfile & { user: User })[]>;
  getTradiesByCategory(category: string, limit?: number): Promise<(TradieProfile & { user: User })[]>;
  
  // Jobs
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined>;
  getJobsByCustomer(customerId: number): Promise<Job[]>;
  getJobsByTradie(tradieId: number): Promise<Job[]>;
  getRecentJobs(limit?: number): Promise<(Job & { customer: User })[]>;
  getJobsByPostcode(postcode: string, limit?: number): Promise<(Job & { customer: User })[]>;
  getActiveJobsByCategory(category: string): Promise<Job[]>;
  
  // Job Quotes
  createJobQuote(quote: InsertJobQuote): Promise<JobQuote>;
  getJobQuotes(jobId: number): Promise<(JobQuote & { tradie: TradieProfile & { user: User } })[]>;
  getQuotesByTradie(tradieId: number): Promise<(JobQuote & { job: Job })[]>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByTradie(tradieId: number): Promise<(Review & { customer: User })[]>;
  
  // Work Photos
  createWorkPhoto(photo: InsertWorkPhoto): Promise<WorkPhoto>;
  getWorkPhotosByTradie(tradieId: number): Promise<WorkPhoto[]>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getJobMessages(jobId: number): Promise<(Message & { sender: User; receiver: User })[]>;
  getUserConversations(userId: number): Promise<any[]>;
  getConversationMessages(userId: number, participantId: number): Promise<(Message & { sender: User; receiver: User })[]>;
  
  // Contracts
  createContract(contract: InsertContract): Promise<Contract>;
  getContractsByJob(jobId: number): Promise<Contract[]>;
  getContractById(id: number): Promise<Contract | undefined>;
  signContract(contractId: number, signedBy: number, signatureData: string, ipAddress: string): Promise<Contract | undefined>;
  getContractsByUser(userId: number): Promise<(Contract & { job: Job; customer: User; tradie: TradieProfile & { user: User } })[]>;
  
  // Banking & Payments
  createTradieBankAccount(account: InsertTradieBankAccount): Promise<TradieBankAccount>;
  getTradieBankAccount(tradieId: number): Promise<TradieBankAccount | undefined>;
  updateTradieBankAccount(tradieId: number, updates: Partial<TradieBankAccount>): Promise<TradieBankAccount | undefined>;
  verifyBankAccount(tradieId: number): Promise<TradieBankAccount | undefined>;
  
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  getPaymentTransaction(id: number): Promise<PaymentTransaction | undefined>;
  updatePaymentTransaction(id: number, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction | undefined>;
  getPaymentsByTradie(tradieId: number): Promise<PaymentTransaction[]>;
  getPaymentsByCustomer(customerId: number): Promise<PaymentTransaction[]>;
  
  createPaymentDispute(dispute: InsertPaymentDispute): Promise<PaymentDispute>;
  getPaymentDisputes(transactionId?: number): Promise<PaymentDispute[]>;
  resolvePaymentDispute(id: number, resolution: string, resolvedBy: number): Promise<PaymentDispute | undefined>;
  
  createPlatformEarnings(earnings: InsertPlatformEarnings): Promise<PlatformEarnings>;
  getPlatformEarnings(month?: string, year?: string): Promise<PlatformEarnings[]>;

  // Payment Scheduling methods
  createPaymentSchedule(schedule: InsertPaymentSchedule): Promise<PaymentSchedule>;
  getPaymentSchedule(id: number): Promise<PaymentSchedule | undefined>;
  getPaymentScheduleByQuote(quoteId: number): Promise<PaymentSchedule | undefined>;
  updatePaymentSchedule(id: number, updates: Partial<PaymentSchedule>): Promise<PaymentSchedule | undefined>;
  getPaymentSchedulesByCustomer(customerId: number): Promise<PaymentSchedule[]>;
  getPaymentSchedulesByTradie(tradieId: number): Promise<PaymentSchedule[]>;
  getPaymentScheduleWithDetails(id: number): Promise<PaymentSchedule | undefined>;
  
  createScheduledPayment(payment: InsertScheduledPayment): Promise<ScheduledPayment>;
  getScheduledPayment(id: number): Promise<ScheduledPayment | undefined>;
  updateScheduledPayment(id: number, updates: Partial<ScheduledPayment>): Promise<ScheduledPayment | undefined>;
  getScheduledPaymentsBySchedule(scheduleId: number): Promise<ScheduledPayment[]>;

  // Invoice methods (replaces payment processing)
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByTradie(tradieId: number): Promise<Invoice[]>;
  getInvoicesByCustomer(customerId: number): Promise<Invoice[]>;
  updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<void>;
  sendInvoice(id: number): Promise<Invoice | undefined>;
  markInvoiceAsViewed(id: number): Promise<Invoice | undefined>;
  markInvoiceAsPaid(id: number): Promise<Invoice | undefined>;

  // Admin monitoring methods
  getAllUsers(): Promise<User[]>;
  getAllJobs(): Promise<(Job & { customer: User })[]>;
  getAllMessages(): Promise<Message[]>;
  getAllContracts(): Promise<Contract[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private tradieProfiles: Map<number, TradieProfile> = new Map();
  private jobs: Map<number, Job> = new Map();
  private jobQuotes: Map<number, JobQuote> = new Map();
  private reviews: Map<number, Review> = new Map();
  private workPhotos: Map<number, WorkPhoto> = new Map();
  private messages: Map<number, Message> = new Map();
  private invoices: Map<number, Invoice> = new Map();
  private contracts: Map<number, Contract> = new Map();
  private tradieBankAccounts: Map<number, TradieBankAccount> = new Map();
  private paymentTransactions: Map<number, PaymentTransaction> = new Map();
  private paymentDisputes: Map<number, PaymentDispute> = new Map();
  private platformEarnings: Map<number, PlatformEarnings> = new Map();
  private paymentSchedules: Map<number, PaymentSchedule> = new Map();
  private scheduledPayments: Map<number, ScheduledPayment> = new Map();
  
  private currentUserId = 1;
  private currentTradieId = 1;
  private currentJobId = 1;
  private currentQuoteId = 1;
  private currentReviewId = 1;
  private currentPhotoId = 1;
  private currentMessageId = 1;
  private currentInvoiceId = 1;
  private currentContractId = 1;
  private currentBankAccountId = 1;
  private currentTransactionId = 1;
  private currentDisputeId = 1;
  private currentEarningsId = 1;
  private currentScheduleId = 1;
  private currentScheduledPaymentId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample customers
    const customer1 = this.createUserSync({
      username: "john_smith",
      email: "john@example.com",
      password: "password123",
      userType: "customer",
      firstName: "John",
      lastName: "Smith",
      phone: "0412 345 678",
      location: "Bondi, NSW",
      postcode: "2026"
    });

    const customer2 = this.createUserSync({
      username: "sarah_jones",
      email: "sarah@example.com", 
      password: "password123",
      userType: "customer",
      firstName: "Sarah",
      lastName: "Jones",
      phone: "0423 456 789",
      location: "Paddington, NSW",
      postcode: "2021"
    });

    // Add Brad (our client for the model engagement)
    const brad = this.createUserSync({
      username: "brad_thompson",
      email: "brad.thompson@email.com",
      password: "password123",
      userType: "customer",
      firstName: "Brad",
      lastName: "Thompson",
      phone: "0455 123 789",
      location: "Bondi Beach, NSW",
      postcode: "2026"
    });

    // Create sample tradies
    const tradieUser1 = this.createUserSync({
      username: "mike_plumber",
      email: "mike@example.com",
      password: "password123", 
      userType: "tradie",
      firstName: "Mike",
      lastName: "Thompson",
      phone: "0434 567 890",
      location: "Eastern Suburbs, NSW",
      postcode: "2026",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
    });

    const tradieProfile1 = this.createTradieProfileSync({
      userId: tradieUser1.id,
      tradeName: "Eastern Suburbs Plumbing",
      license: "NSW License #12345",
      insurance: "Public Liability $10M",
      yearsExperience: 15,
      servicesOffered: ["Plumbing", "Emergency repairs", "Bathroom renovations"],
      responseTime: "2hr",
      hourlyRate: "95"
    });
    // Update the profile with review data
    tradieProfile1.rating = "4.8";
    tradieProfile1.totalReviews = 47;
    tradieProfile1.totalJobs = 89;

    const tradieUser2 = this.createUserSync({
      username: "alex_electrician",
      email: "alex@example.com",
      password: "password123",
      userType: "tradie", 
      firstName: "Alex",
      lastName: "Wilson",
      phone: "0445 678 901",
      location: "Inner West, NSW",
      postcode: "2040",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
    });

    const tradieProfile2 = this.createTradieProfileSync({
      userId: tradieUser2.id,
      tradeName: "Bright Spark Electrical",
      license: "NSW Electrical License #67890",
      insurance: "Public Liability $5M",
      yearsExperience: 8,
      servicesOffered: ["Electrical", "Safety switches", "Lighting installation"],
      responseTime: "4hr",
      hourlyRate: "110"
    });
    tradieProfile2.rating = "4.9";
    tradieProfile2.totalReviews = 32;
    tradieProfile2.totalJobs = 56;

    const tradieUser3 = this.createUserSync({
      username: "dave_painter",
      email: "dave@example.com",
      password: "password123",
      userType: "tradie",
      firstName: "Dave", 
      lastName: "Martinez",
      phone: "0456 789 012",
      location: "Northern Beaches, NSW",
      postcode: "2097",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
    });

    const tradieProfile3 = this.createTradieProfileSync({
      userId: tradieUser3.id,
      tradeName: "Coastal Painting Co",
      insurance: "Public Liability $2M", 
      yearsExperience: 12,
      servicesOffered: ["Painting", "Interior design", "Exterior painting"],
      responseTime: "1 day",
      hourlyRate: "55"
    });
    tradieProfile3.rating = "4.7";
    tradieProfile3.totalReviews = 28;
    tradieProfile3.totalJobs = 43;

    // Add Testers Plumbing (our builder for the model engagement)
    const testersPlumbingUser = this.createUserSync({
      username: "testers_plumbing",
      email: "steve@testersplumbing.com.au",
      password: "password123",
      userType: "tradie",
      firstName: "Steve",
      lastName: "Martinez",
      phone: "0488 555 123",
      location: "Bondi Junction, NSW",
      postcode: "2022",
      profileImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
    });

    const testersPlumbingProfile = this.createTradieProfileSync({
      userId: testersPlumbingUser.id,
      tradeName: "Testers Plumbing",
      license: "NSW Plumbing License #TP-2024",
      insurance: "Public Liability $15M",
      yearsExperience: 22,
      servicesOffered: ["Plumbing", "Gas fitting", "Blocked drains", "Emergency callouts", "Bathroom renovations"],
      responseTime: "30min",
      hourlyRate: "120",
      bio: "Family-owned plumbing business serving Eastern Suburbs for over 20 years. Specializing in emergency repairs, bathroom renovations, and gas fitting. Available 24/7 for urgent callouts."
    });
    testersPlumbingProfile.rating = "4.9";
    testersPlumbingProfile.totalReviews = 156;
    testersPlumbingProfile.totalJobs = 342;

    // Create sample jobs
    this.createJobSync({
      customerId: customer1.id,
      title: "Kitchen Sink Installation",
      description: "Need a new kitchen sink installed with modern taps. Existing plumbing needs to be connected to new fixture.",
      category: "Plumbing",
      location: "Bondi",
      postcode: "2026",
      budgetMin: "300",
      budgetMax: "500", 
      timeline: "This week",
      images: ["kitchen_sink.jpg"]
    });

    // Add Brad's bathroom renovation job
    const bradJob = this.createJobSync({
      customerId: brad.id,
      title: "Complete Bathroom Renovation",
      description: "Looking for a complete bathroom renovation in my Bondi Beach apartment. Need to replace old shower, vanity, toilet, and tiles. The space is 2.5m x 2m. Looking for modern, coastal-style finish with quality fixtures. Includes removing old fixtures, waterproofing, new plumbing connections, and tiling.",
      category: "Plumbing",
      location: "Bondi Beach",
      postcode: "2026",
      budgetMin: "8500",
      budgetMax: "12000",
      timeline: "2-3 weeks",
      images: ["old_bathroom.jpg", "inspiration.jpg"]
    });

    this.createJobSync({
      customerId: customer2.id,
      title: "Ceiling Fan Installation",
      description: "Install ceiling fan in master bedroom. Existing light fitting to be replaced.",
      category: "Electrical",
      location: "Paddington", 
      postcode: "2021",
      budgetMin: "200",
      budgetMax: "400",
      timeline: "ASAP",
      images: ["ceiling_fan.jpg"]
    });

    // Create sample work photos
    this.createWorkPhotoSync({
      tradieId: tradieProfile1.id,
      imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      description: "Modern bathroom renovation",
      jobCategory: "Plumbing"
    });

    this.createWorkPhotoSync({
      tradieId: tradieProfile1.id,
      imageUrl: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      description: "Kitchen plumbing installation", 
      jobCategory: "Plumbing"
    });

    this.createWorkPhotoSync({
      tradieId: tradieProfile2.id,
      imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      description: "LED lighting installation",
      jobCategory: "Electrical"
    });

    // Add Testers Plumbing work portfolio
    this.createWorkPhotoSync({
      tradieId: testersPlumbingProfile.id,
      imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      description: "Modern bathroom renovation - Bondi apartment",
      jobCategory: "Plumbing"
    });

    this.createWorkPhotoSync({
      tradieId: testersPlumbingProfile.id,
      imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      description: "Luxury shower installation with rainfall head",
      jobCategory: "Plumbing"
    });

    this.createWorkPhotoSync({
      tradieId: testersPlumbingProfile.id,
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      description: "Complete bathroom suite installation",
      jobCategory: "Plumbing"
    });

    // Add Testers Plumbing quote for Brad's job
    this.createQuoteSync({
      jobId: bradJob.id,
      tradieId: testersPlumbingProfile.id,
      quoteAmount: "9850",
      timeline: "14 days",
      description: "Complete bathroom renovation including: 1) Remove existing fixtures and tiles 2) New waterproofing and plumbing rough-in 3) Install modern vanity, shower, toilet 4) Premium tiles and fixtures 5) Quality finish with 2-year warranty. Price includes all materials and labor.",
      materials: "Premium tiles, rainfall shower head, modern vanity, rimless toilet, waterproofing membrane",
      laborCost: "4200",
      materialCost: "5650"
    });

    // Create sample reviews
    this.createReviewSync({
      jobId: 1,
      customerId: customer1.id,
      tradieId: tradieProfile1.id,
      rating: 5,
      comment: "Excellent work! Mike was professional and completed the job quickly."
    });

    this.createReviewSync({
      jobId: 2, 
      customerId: customer2.id,
      tradieId: tradieProfile2.id,
      rating: 5,
      comment: "Great electrician, very knowledgeable and tidy work."
    });

    // Add sample reviews for Testers Plumbing
    this.createReviewSync({
      jobId: bradJob.id,
      customerId: customer1.id,
      tradieId: testersPlumbingProfile.id,
      rating: 5,
      comment: "Steve and his team from Testers Plumbing did an amazing job on our bathroom renovation last year. Professional, clean, and finished exactly on time. Highly recommend!"
    });

    this.createReviewSync({
      jobId: bradJob.id,
      customerId: customer2.id,
      tradieId: testersPlumbingProfile.id,
      rating: 5,
      comment: "Emergency call-out at 9pm on Sunday - Steve was there within 30 minutes! Fixed our burst pipe quickly and efficiently. Family business that really cares about their customers."
    });

    // Add messaging between Brad and Testers Plumbing
    this.createMessageSync({
      senderId: brad.id,
      receiverId: testersPlumbingUser.id,
      jobId: bradJob.id,
      content: "Hi Steve, I saw your quote for my bathroom renovation. Very impressed with your portfolio and reviews. Could we schedule a time for you to come have a look at the space this week?"
    });

    this.createMessageSync({
      senderId: testersPlumbingUser.id,
      receiverId: brad.id,
      jobId: bradJob.id,
      content: "G'day Brad! Thanks for getting in touch. I'd be happy to take a look. I'm available tomorrow afternoon or Thursday morning. The photos look like a great project - I've done similar work in Bondi Beach apartments before."
    });

    this.createMessageSync({
      senderId: brad.id,
      receiverId: testersPlumbingUser.id,
      jobId: bradJob.id,
      content: "Thursday morning works perfectly. Say 9am? I'll be there and can show you my ideas for the layout. Your previous work looks exactly like what I'm after."
    });

    this.createMessageSync({
      senderId: testersPlumbingUser.id,
      receiverId: brad.id,
      jobId: bradJob.id,
      content: "Perfect! Thursday 9am it is. I'll bring some samples and we can discuss timeline and fixture options. See you then mate!"
    });
  }

  private createUserSync(insertUser: InsertUser): User {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      phone: insertUser.phone || null,
      location: insertUser.location || null,
      postcode: insertUser.postcode || null,
      profileImage: insertUser.profileImage || null,
      bio: insertUser.bio || null,
      isVerified: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  private createTradieProfileSync(insertProfile: InsertTradieProfile): TradieProfile {
    const id = this.currentTradieId++;
    const profile: TradieProfile = {
      ...insertProfile,
      id,
      license: insertProfile.license || null,
      insurance: insertProfile.insurance || null,
      yearsExperience: insertProfile.yearsExperience || null,
      servicesOffered: insertProfile.servicesOffered || null,
      responseTime: insertProfile.responseTime || null,
      hourlyRate: insertProfile.hourlyRate || null,
      rating: "0",
      totalReviews: 0,
      totalJobs: 0,
    };
    this.tradieProfiles.set(id, profile);
    return profile;
  }

  private createJobSync(insertJob: InsertJob): Job {
    const id = this.currentJobId++;
    const job: Job = {
      ...insertJob,
      id,
      budgetMin: insertJob.budgetMin || null,
      budgetMax: insertJob.budgetMax || null,
      images: insertJob.images || null,
      status: "posted",
      acceptedBy: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.jobs.set(id, job);
    return job;
  }

  private createWorkPhotoSync(insertPhoto: InsertWorkPhoto): WorkPhoto {
    const id = this.currentPhotoId++;
    const photo: WorkPhoto = {
      ...insertPhoto,
      id,
      description: insertPhoto.description || null,
      jobCategory: insertPhoto.jobCategory || null,
      createdAt: new Date(),
    };
    this.workPhotos.set(id, photo);
    return photo;
  }

  private createReviewSync(insertReview: InsertReview): Review {
    const id = this.currentReviewId++;
    const review: Review = {
      ...insertReview,
      id,
      comment: insertReview.comment || null,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  private createQuoteSync(insertQuote: InsertJobQuote): JobQuote {
    const id = this.currentQuoteId++;
    const quote: JobQuote = {
      ...insertQuote,
      id,
      materials: insertQuote.materials || null,
      laborCost: insertQuote.laborCost || null,
      materialCost: insertQuote.materialCost || null,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "pending",
      submittedAt: new Date(),
    };
    this.jobQuotes.set(id, quote);
    return quote;
  }

  private createMessageSync(insertMessage: { senderId: number; receiverId: number; jobId: number; content: string }): Message {
    const id = this.currentMessageId++;
    const message: Message = {
      id,
      jobId: insertMessage.jobId,
      senderId: insertMessage.senderId,
      receiverId: insertMessage.receiverId,
      message: insertMessage.content,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.messages.set(id, message);
    return message;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      phone: insertUser.phone || null,
      location: insertUser.location || null,
      postcode: insertUser.postcode || null,
      profileImage: insertUser.profileImage || null,
      bio: insertUser.bio || null,
      isVerified: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }
  async getTradieProfile(userId: number): Promise<TradieProfile | undefined> {
    return Array.from(this.tradieProfiles.values()).find(profile => profile.userId === userId);
  }

  async getTradieProfileById(id: number): Promise<TradieProfile | undefined> {
    return this.tradieProfiles.get(id);
  }

  async createTradieProfile(insertProfile: InsertTradieProfile): Promise<TradieProfile> {
    const id = this.currentTradieId++;
    const profile: TradieProfile = {
      ...insertProfile,
      id,
      license: insertProfile.license || null,
      insurance: insertProfile.insurance || null,
      yearsExperience: insertProfile.yearsExperience || null,
      servicesOffered: insertProfile.servicesOffered || null,
      responseTime: insertProfile.responseTime || null,
      hourlyRate: insertProfile.hourlyRate || null,
      rating: "0",
      totalReviews: 0,
      totalJobs: 0,
    };
    this.tradieProfiles.set(id, profile);
    return profile;
  }

  async updateTradieProfile(id: number, updates: Partial<TradieProfile>): Promise<TradieProfile | undefined> {
    const profile = this.tradieProfiles.get(id);
    if (!profile) return undefined;
    
    const updated = { ...profile, ...updates };
    this.tradieProfiles.set(id, updated);
    return updated;
  }

  async updateTradieSubscription(userId: number, plan: string): Promise<void> {
    const profile = Array.from(this.tradieProfiles.values()).find(p => p.userId === userId);
    if (profile) {
      (profile as any).subscriptionPlan = plan;
      (profile as any).subscriptionStatus = "active";
      this.tradieProfiles.set(profile.id, profile);
    }
  }

  async getAllTradies(limit = 10): Promise<(TradieProfile & { user: User })[]> {
    const tradies = Array.from(this.tradieProfiles.values()).slice(0, limit);
    return tradies.map(tradie => ({
      ...tradie,
      user: this.users.get(tradie.userId)!
    }));
  }

  async getTradiesByCategory(category: string, limit = 10): Promise<(TradieProfile & { user: User })[]> {
    const tradies = Array.from(this.tradieProfiles.values())
      .filter(tradie => tradie.servicesOffered?.includes(category))
      .slice(0, limit);
    
    return tradies.map(tradie => ({
      ...tradie,
      user: this.users.get(tradie.userId)!
    }));
  }

  // Jobs
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const job: Job = {
      ...insertJob,
      id,
      status: "posted",
      acceptedBy: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updated = { ...job, ...updates };
    this.jobs.set(id, updated);
    return updated;
  }

  async getJobsByCustomer(customerId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.customerId === customerId);
  }

  async getJobsByTradie(tradieId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.acceptedBy === tradieId);
  }

  async getRecentJobs(limit = 10): Promise<(Job & { customer: User })[]> {
    const jobs = Array.from(this.jobs.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
    
    return jobs.map(job => ({
      ...job,
      customer: this.users.get(job.customerId)!
    }));
  }

  async getJobsByPostcode(postcode: string, limit = 10): Promise<(Job & { customer: User })[]> {
    const jobs = Array.from(this.jobs.values())
      .filter(job => job.postcode === postcode)
      .slice(0, limit);
    
    return jobs.map(job => ({
      ...job,
      customer: this.users.get(job.customerId)!
    }));
  }

  async getActiveJobsByCategory(category: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => 
      job.category === category && job.status === "posted"
    );
  }

  // Job Quotes
  async createJobQuote(insertQuote: InsertJobQuote): Promise<JobQuote> {
    const id = this.currentQuoteId++;
    const quote: JobQuote = {
      ...insertQuote,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.jobQuotes.set(id, quote);
    return quote;
  }

  async getJobQuotes(jobId: number): Promise<(JobQuote & { tradie: TradieProfile & { user: User } })[]> {
    const quotes = Array.from(this.jobQuotes.values()).filter(quote => quote.jobId === jobId);
    return quotes.map(quote => {
      const tradie = this.tradieProfiles.get(quote.tradieId)!;
      return {
        ...quote,
        tradie: {
          ...tradie,
          user: this.users.get(tradie.userId)!
        }
      };
    });
  }

  async getQuotesByTradie(tradieId: number): Promise<(JobQuote & { job: Job })[]> {
    const quotes = Array.from(this.jobQuotes.values()).filter(quote => quote.tradieId === tradieId);
    return quotes.map(quote => ({
      ...quote,
      job: this.jobs.get(quote.jobId)!
    }));
  }

  // Reviews
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);

    // Update tradie rating
    const tradieReviews = Array.from(this.reviews.values()).filter(r => r.tradieId === insertReview.tradieId);
    const avgRating = tradieReviews.reduce((sum, r) => sum + r.rating, 0) / tradieReviews.length;
    const tradie = this.tradieProfiles.get(insertReview.tradieId);
    if (tradie) {
      this.tradieProfiles.set(insertReview.tradieId, {
        ...tradie,
        rating: avgRating.toFixed(1),
        totalReviews: tradieReviews.length
      });
    }

    return review;
  }

  async getReviewsByTradie(tradieId: number): Promise<(Review & { customer: User })[]> {
    const reviews = Array.from(this.reviews.values()).filter(review => review.tradieId === tradieId);
    return reviews.map(review => ({
      ...review,
      customer: this.users.get(review.customerId)!
    }));
  }

  // Work Photos
  async createWorkPhoto(insertPhoto: InsertWorkPhoto): Promise<WorkPhoto> {
    const id = this.currentPhotoId++;
    const photo: WorkPhoto = {
      ...insertPhoto,
      id,
      createdAt: new Date(),
    };
    this.workPhotos.set(id, photo);
    return photo;
  }

  async getWorkPhotosByTradie(tradieId: number): Promise<WorkPhoto[]> {
    return Array.from(this.workPhotos.values()).filter(photo => photo.tradieId === tradieId);
  }

  // Messages
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getJobMessages(jobId: number): Promise<(Message & { sender: User; receiver: User })[]> {
    const messages = Array.from(this.messages.values()).filter(message => message.jobId === jobId);
    return messages.map(message => ({
      ...message,
      sender: this.users.get(message.senderId)!,
      receiver: this.users.get(message.receiverId)!
    }));
  }

  async getUserConversations(userId: number): Promise<any[]> {
    const userMessages = Array.from(this.messages.values()).filter(
      m => m.senderId === userId || m.receiverId === userId
    );
    
    // Group messages by conversation partner
    const conversationMap = new Map<number, any>();
    
    userMessages.forEach(message => {
      const participantId = message.senderId === userId ? message.receiverId : message.senderId;
      const participant = this.users.get(participantId);
      
      if (!participant) return;
      
      const existing = conversationMap.get(participantId);
      if (!existing || new Date(message.createdAt) > new Date(existing.lastMessageTime)) {
        const job = message.jobId ? this.jobs.get(message.jobId) : null;
        
        conversationMap.set(participantId, {
          id: participantId,
          participantId,
          participantName: `${participant.firstName} ${participant.lastName}`,
          participantType: participant.userType,
          profileImage: participant.profileImage,
          lastMessage: message.message,
          lastMessageTime: message.createdAt,
          jobTitle: job?.title,
          jobId: message.jobId
        });
      }
    });
    
    // Calculate unread counts and return sorted by last message time
    return Array.from(conversationMap.values())
      .map(conversation => ({
        ...conversation,
        unreadCount: userMessages.filter(m => 
          m.senderId === conversation.participantId && 
          m.receiverId === userId
        ).length
      }))
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  }

  async getConversationMessages(userId: number, participantId: number): Promise<(Message & { sender: User; receiver: User })[]> {
    const conversationMessages = Array.from(this.messages.values()).filter(
      m => (m.senderId === userId && m.receiverId === participantId) || 
           (m.senderId === participantId && m.receiverId === userId)
    );
    
    // Sort by creation time (oldest first)
    conversationMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return conversationMessages.map(message => {
      const sender = this.users.get(message.senderId)!;
      const receiver = this.users.get(message.receiverId)!;
      return { ...message, sender, receiver };
    });
  }

  // Contract methods
  async createContract(insertContract: InsertContract): Promise<Contract> {
    const contract: Contract = {
      id: this.currentContractId++,
      ...insertContract,
      signedBy: null,
      signedAt: null,
      signatureData: null,
      ipAddress: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.contracts.set(contract.id, contract);
    return contract;
  }

  async getContractsByJob(jobId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values())
      .filter(contract => contract.jobId === jobId);
  }

  async getContractById(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async signContract(contractId: number, signedBy: number, signatureData: string, ipAddress: string): Promise<Contract | undefined> {
    const contract = this.contracts.get(contractId);
    if (!contract) return undefined;

    const updatedContract: Contract = {
      ...contract,
      signedBy,
      signedAt: new Date(),
      signatureData,
      ipAddress,
      status: "signed",
      updatedAt: new Date(),
    };

    this.contracts.set(contractId, updatedContract);
    return updatedContract;
  }

  async getContractsByUser(userId: number): Promise<(Contract & { job: Job; customer: User; tradie: TradieProfile & { user: User } })[]> {
    const contracts = Array.from(this.contracts.values())
      .filter(contract => contract.customerId === userId || 
                         this.tradieProfiles.get(contract.tradieId)?.userId === userId);

    return contracts.map(contract => ({
      ...contract,
      job: this.jobs.get(contract.jobId)!,
      customer: this.users.get(contract.customerId)!,
      tradie: {
        ...this.tradieProfiles.get(contract.tradieId)!,
        user: this.users.get(this.tradieProfiles.get(contract.tradieId)!.userId)!,
      },
    }));
  }

  // Admin monitoring methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllJobs(): Promise<(Job & { customer: User })[]> {
    return Array.from(this.jobs.values()).map(job => ({
      ...job,
      customer: this.users.get(job.customerId)!
    }));
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async getAllContracts(): Promise<Contract[]> {
    return Array.from(this.contracts.values());
  }

  // Banking & Payment Methods
  async createTradieBankAccount(insertAccount: InsertTradieBankAccount): Promise<TradieBankAccount> {
    const account: TradieBankAccount = {
      id: this.currentBankAccountId++,
      ...insertAccount,
      isVerified: false,
      verificationDate: null,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    this.tradieBankAccounts.set(account.id, account);
    return account;
  }

  async getTradieBankAccount(tradieId: number): Promise<TradieBankAccount | undefined> {
    return Array.from(this.tradieBankAccounts.values()).find(account => account.tradieId === tradieId);
  }

  async updateTradieBankAccount(tradieId: number, updates: Partial<TradieBankAccount>): Promise<TradieBankAccount | undefined> {
    const account = await this.getTradieBankAccount(tradieId);
    if (!account) return undefined;

    const updatedAccount: TradieBankAccount = {
      ...account,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    this.tradieBankAccounts.set(account.id, updatedAccount);
    return updatedAccount;
  }

  async verifyBankAccount(tradieId: number): Promise<TradieBankAccount | undefined> {
    const account = await this.getTradieBankAccount(tradieId);
    if (!account) return undefined;

    const verifiedAccount: TradieBankAccount = {
      ...account,
      isVerified: true,
      verificationDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    this.tradieBankAccounts.set(account.id, verifiedAccount);
    return verifiedAccount;
  }

  async createPaymentTransaction(insertTransaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const transaction: PaymentTransaction = {
      id: this.currentTransactionId++,
      ...insertTransaction,
      status: "pending",
      paymentDate: null,
      transferDate: null,
      failureReason: null,
      refundReason: null,
      refundAmount: null,
      metadata: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.paymentTransactions.set(transaction.id, transaction);
    return transaction;
  }

  async getPaymentTransaction(id: number): Promise<PaymentTransaction | undefined> {
    return this.paymentTransactions.get(id);
  }

  async updatePaymentTransaction(id: number, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction | undefined> {
    const transaction = this.paymentTransactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction: PaymentTransaction = {
      ...transaction,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.paymentTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getPaymentsByTradie(tradieId: number): Promise<PaymentTransaction[]> {
    return Array.from(this.paymentTransactions.values()).filter(payment => payment.tradieId === tradieId);
  }

  async getPaymentsByCustomer(customerId: number): Promise<PaymentTransaction[]> {
    return Array.from(this.paymentTransactions.values()).filter(payment => payment.customerId === customerId);
  }

  async createPaymentDispute(insertDispute: InsertPaymentDispute): Promise<PaymentDispute> {
    const dispute: PaymentDispute = {
      id: this.currentDisputeId++,
      ...insertDispute,
      status: "open",
      resolution: null,
      resolvedBy: null,
      resolvedAt: null,
      createdAt: new Date().toISOString()
    };
    
    this.paymentDisputes.set(dispute.id, dispute);
    return dispute;
  }

  async getPaymentDisputes(transactionId?: number): Promise<PaymentDispute[]> {
    const disputes = Array.from(this.paymentDisputes.values());
    if (transactionId) {
      return disputes.filter(dispute => dispute.transactionId === transactionId);
    }
    return disputes;
  }

  async resolvePaymentDispute(id: number, resolution: string, resolvedBy: number): Promise<PaymentDispute | undefined> {
    const dispute = this.paymentDisputes.get(id);
    if (!dispute) return undefined;

    const resolvedDispute: PaymentDispute = {
      ...dispute,
      status: "resolved",
      resolution,
      resolvedBy,
      resolvedAt: new Date().toISOString()
    };
    
    this.paymentDisputes.set(id, resolvedDispute);
    return resolvedDispute;
  }

  async createPlatformEarnings(insertEarnings: InsertPlatformEarnings): Promise<PlatformEarnings> {
    const earnings: PlatformEarnings = {
      id: this.currentEarningsId++,
      ...insertEarnings,
      date: new Date().toISOString()
    };
    
    this.platformEarnings.set(earnings.id, earnings);
    return earnings;
  }

  async getPlatformEarnings(month?: string, year?: string): Promise<PlatformEarnings[]> {
    const earnings = Array.from(this.platformEarnings.values());
    
    if (month && year) {
      return earnings.filter(earning => earning.month === month && earning.year === year);
    } else if (year) {
      return earnings.filter(earning => earning.year === year);
    }
    
    return earnings;
  }

  // Payment Scheduling Implementation
  async createPaymentSchedule(insertSchedule: InsertPaymentSchedule): Promise<PaymentSchedule> {
    const schedule: PaymentSchedule = {
      id: this.currentScheduleId++,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...insertSchedule
    };
    
    this.paymentSchedules.set(schedule.id, schedule);
    return schedule;
  }

  async getPaymentSchedule(id: number): Promise<PaymentSchedule | undefined> {
    return this.paymentSchedules.get(id);
  }

  async getPaymentScheduleByQuote(quoteId: number): Promise<PaymentSchedule | undefined> {
    return Array.from(this.paymentSchedules.values()).find(schedule => schedule.quoteId === quoteId);
  }

  async updatePaymentSchedule(id: number, updates: Partial<PaymentSchedule>): Promise<PaymentSchedule | undefined> {
    const schedule = this.paymentSchedules.get(id);
    if (!schedule) return undefined;

    const updatedSchedule: PaymentSchedule = {
      ...schedule,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.paymentSchedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async getPaymentSchedulesByCustomer(customerId: number): Promise<PaymentSchedule[]> {
    return Array.from(this.paymentSchedules.values())
      .filter(schedule => schedule.customerId === customerId)
      .map(schedule => {
        // Add related data
        const quote = this.jobQuotes.get(schedule.quoteId);
        const job = quote ? this.jobs.get(quote.jobId) : undefined;
        const tradie = this.tradieProfiles.get(schedule.tradieId);
        const tradieUser = tradie ? this.users.get(tradie.userId) : undefined;

        return {
          ...schedule,
          job: job ? { title: job.title, description: job.description } : { title: "Unknown Job", description: "" },
          tradie: tradie && tradieUser ? {
            tradeName: tradie.tradeName,
            user: { firstName: tradieUser.firstName, lastName: tradieUser.lastName }
          } : { tradeName: "Unknown Tradie", user: { firstName: "", lastName: "" } },
          payments: Array.from(this.scheduledPayments.values()).filter(p => p.scheduleId === schedule.id)
        } as any;
      });
  }

  async getPaymentSchedulesByTradie(tradieId: number): Promise<PaymentSchedule[]> {
    return Array.from(this.paymentSchedules.values())
      .filter(schedule => schedule.tradieId === tradieId)
      .map(schedule => {
        // Add related data
        const quote = this.jobQuotes.get(schedule.quoteId);
        const job = quote ? this.jobs.get(quote.jobId) : undefined;
        const customer = job ? this.users.get(job.customerId) : undefined;

        return {
          ...schedule,
          job: job ? { title: job.title, description: job.description } : { title: "Unknown Job", description: "" },
          customer: customer ? { firstName: customer.firstName, lastName: customer.lastName } : { firstName: "", lastName: "" },
          payments: Array.from(this.scheduledPayments.values()).filter(p => p.scheduleId === schedule.id)
        } as any;
      });
  }

  async getPaymentScheduleWithDetails(id: number): Promise<PaymentSchedule | undefined> {
    const schedule = this.paymentSchedules.get(id);
    if (!schedule) return undefined;

    const quote = this.jobQuotes.get(schedule.quoteId);
    const job = quote ? this.jobs.get(quote.jobId) : undefined;
    const customer = job ? this.users.get(job.customerId) : undefined;
    const tradie = this.tradieProfiles.get(schedule.tradieId);
    const tradieUser = tradie ? this.users.get(tradie.userId) : undefined;
    const payments = Array.from(this.scheduledPayments.values()).filter(p => p.scheduleId === schedule.id);

    return {
      ...schedule,
      job: job ? { title: job.title, description: job.description } : { title: "Unknown Job", description: "" },
      customer: customer ? { firstName: customer.firstName, lastName: customer.lastName } : { firstName: "", lastName: "" },
      tradie: tradie && tradieUser ? {
        tradeName: tradie.tradeName,
        user: { firstName: tradieUser.firstName, lastName: tradieUser.lastName }
      } : { tradeName: "Unknown Tradie", user: { firstName: "", lastName: "" } },
      payments
    } as any;
  }

  async createScheduledPayment(insertPayment: InsertScheduledPayment): Promise<ScheduledPayment> {
    const payment: ScheduledPayment = {
      id: this.currentScheduledPaymentId++,
      status: "pending",
      paidAt: null,
      paymentMethod: null,
      transactionId: null,
      failureReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...insertPayment
    };
    
    this.scheduledPayments.set(payment.id, payment);
    return payment;
  }

  async getScheduledPayment(id: number): Promise<ScheduledPayment | undefined> {
    return this.scheduledPayments.get(id);
  }

  async updateScheduledPayment(id: number, updates: Partial<ScheduledPayment>): Promise<ScheduledPayment | undefined> {
    const payment = this.scheduledPayments.get(id);
    if (!payment) return undefined;

    const updatedPayment: ScheduledPayment = {
      ...payment,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.scheduledPayments.set(id, updatedPayment);
    return updatedPayment;
  }

  async getScheduledPaymentsBySchedule(scheduleId: number): Promise<ScheduledPayment[]> {
    return Array.from(this.scheduledPayments.values()).filter(payment => payment.scheduleId === scheduleId);
  }

  // Invoice methods (replaces payment processing)
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(this.currentInvoiceId).padStart(4, '0')}`;
    
    const invoice: Invoice = {
      id: this.currentInvoiceId++,
      invoiceNumber,
      status: "draft",
      sentAt: null,
      viewedAt: null,
      paidAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...insertInvoice
    };
    
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoicesByTradie(tradieId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values())
      .filter(invoice => invoice.tradieId === tradieId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getInvoicesByCustomer(customerId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values())
      .filter(invoice => invoice.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const updatedInvoice: Invoice = {
      ...invoice,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<void> {
    this.invoices.delete(id);
  }

  async sendInvoice(id: number): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const updatedInvoice: Invoice = {
      ...invoice,
      status: "sent",
      sentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async markInvoiceAsViewed(id: number): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const updatedInvoice: Invoice = {
      ...invoice,
      status: "viewed",
      viewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async markInvoiceAsPaid(id: number): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const updatedInvoice: Invoice = {
      ...invoice,
      status: "paid",
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
}

// Database storage implementation
import { db } from "./db";
import { 
  users as dbUsers, 
  tradieProfiles as dbTradieProfiles, 
  jobs as dbJobs, 
  jobQuotes as dbJobQuotes, 
  reviews as dbReviews, 
  workPhotos as dbWorkPhotos, 
  messages as dbMessages
} from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";

class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Tradie Profiles
  async getTradieProfile(userId: number): Promise<TradieProfile | undefined> {
    const [profile] = await db.select().from(tradieProfiles).where(eq(tradieProfiles.userId, userId));
    return profile || undefined;
  }

  async getTradieProfileById(id: number): Promise<TradieProfile | undefined> {
    const [profile] = await db.select().from(tradieProfiles).where(eq(tradieProfiles.id, id));
    return profile || undefined;
  }

  async createTradieProfile(insertProfile: InsertTradieProfile): Promise<TradieProfile> {
    const [profile] = await db.insert(tradieProfiles).values(insertProfile).returning();
    return profile;
  }

  async updateTradieProfile(id: number, updates: Partial<TradieProfile>): Promise<TradieProfile | undefined> {
    const [profile] = await db.update(tradieProfiles)
      .set(updates)
      .where(eq(tradieProfiles.id, id))
      .returning();
    return profile || undefined;
  }

  async updateTradieSubscription(userId: number, plan: string): Promise<void> {
    const [profile] = await db.select().from(tradieProfiles).where(eq(tradieProfiles.userId, userId));
    if (profile) {
      await db.update(tradieProfiles)
        .set({ subscriptionPlan: plan, subscriptionStatus: "active" } as any)
        .where(eq(tradieProfiles.id, profile.id));
    }
  }

  async getAllTradies(limit = 10): Promise<(TradieProfile & { user: User })[]> {
    const results = await db
      .select({
        id: tradieProfiles.id,
        userId: tradieProfiles.userId,
        tradeName: tradieProfiles.tradeName,
        license: tradieProfiles.license,
        insurance: tradieProfiles.insurance,
        yearsExperience: tradieProfiles.yearsExperience,
        rating: tradieProfiles.rating,
        totalReviews: tradieProfiles.totalReviews,
        totalJobs: tradieProfiles.totalJobs,
        responseTime: tradieProfiles.responseTime,
        servicesOffered: tradieProfiles.servicesOffered,
        hourlyRate: tradieProfiles.hourlyRate,
        user: users
      })
      .from(tradieProfiles)
      .innerJoin(users, eq(tradieProfiles.userId, users.id))
      .limit(limit);

    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      tradeName: result.tradeName,
      license: result.license,
      insurance: result.insurance,
      yearsExperience: result.yearsExperience,
      rating: result.rating,
      totalReviews: result.totalReviews,
      totalJobs: result.totalJobs,
      responseTime: result.responseTime,
      servicesOffered: result.servicesOffered,
      hourlyRate: result.hourlyRate,
      user: result.user
    }));
  }

  async getTradiesByCategory(category: string, limit = 10): Promise<(TradieProfile & { user: User })[]> {
    const results = await db
      .select({
        id: tradieProfiles.id,
        userId: tradieProfiles.userId,
        tradeName: tradieProfiles.tradeName,
        license: tradieProfiles.license,
        insurance: tradieProfiles.insurance,
        yearsExperience: tradieProfiles.yearsExperience,
        rating: tradieProfiles.rating,
        totalReviews: tradieProfiles.totalReviews,
        totalJobs: tradieProfiles.totalJobs,
        responseTime: tradieProfiles.responseTime,
        bio: tradieProfiles.bio,
        servicesOffered: tradieProfiles.servicesOffered,
        hourlyRate: tradieProfiles.hourlyRate,
        user: users
      })
      .from(tradieProfiles)
      .innerJoin(users, eq(tradieProfiles.userId, users.id))
      .where(sql`${tradieProfiles.servicesOffered} @> ARRAY[${category}]`)
      .limit(limit);

    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      tradeName: result.tradeName,
      license: result.license,
      insurance: result.insurance,
      yearsExperience: result.yearsExperience,
      rating: result.rating,
      totalReviews: result.totalReviews,
      totalJobs: result.totalJobs,
      responseTime: result.responseTime,
      bio: result.bio,
      servicesOffered: result.servicesOffered,
      hourlyRate: result.hourlyRate,
      user: result.user
    }));
  }

  // Jobs
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(insertJob).returning();
    return job;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const [job] = await db.update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    return job || undefined;
  }

  async getJobsByCustomer(customerId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.customerId, customerId));
  }

  async getJobsByTradie(tradieId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.customerId, tradieId));
  }

  async getRecentJobs(limit = 10): Promise<(Job & { customer: User })[]> {
    const results = await db
      .select({
        id: jobs.id,
        customerId: jobs.customerId,
        title: jobs.title,
        description: jobs.description,
        category: jobs.category,
        location: jobs.location,
        postcode: jobs.postcode,
        budgetMin: jobs.budgetMin,
        budgetMax: jobs.budgetMax,
        timeline: jobs.timeline,
        status: jobs.status,
        images: jobs.images,
        createdAt: jobs.createdAt,
        customer: users
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.customerId, users.id))
      .orderBy(desc(jobs.createdAt))
      .limit(limit);

    return results.map(result => ({
      id: result.id,
      customerId: result.customerId,
      title: result.title,
      description: result.description,
      category: result.category,
      location: result.location,
      postcode: result.postcode,
      budgetMin: result.budgetMin,
      budgetMax: result.budgetMax,
      timeline: result.timeline,
      status: result.status,
      images: result.images,
      createdAt: result.createdAt,
      customer: result.customer
    }));
  }

  async getJobsByPostcode(postcode: string, limit = 10): Promise<(Job & { customer: User })[]> {
    const results = await db
      .select({
        id: jobs.id,
        customerId: jobs.customerId,
        title: jobs.title,
        description: jobs.description,
        category: jobs.category,
        location: jobs.location,
        postcode: jobs.postcode,
        budgetMin: jobs.budgetMin,
        budgetMax: jobs.budgetMax,
        timeline: jobs.timeline,
        status: jobs.status,
        images: jobs.images,
        createdAt: jobs.createdAt,
        customer: users
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.customerId, users.id))
      .where(eq(jobs.postcode, postcode))
      .orderBy(desc(jobs.createdAt))
      .limit(limit);

    return results.map(result => ({
      id: result.id,
      customerId: result.customerId,
      title: result.title,
      description: result.description,
      category: result.category,
      location: result.location,
      postcode: result.postcode,
      budgetMin: result.budgetMin,
      budgetMax: result.budgetMax,
      timeline: result.timeline,
      status: result.status,
      images: result.images,
      createdAt: result.createdAt,
      customer: result.customer
    }));
  }

  async getActiveJobsByCategory(category: string): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.category, category), eq(jobs.status, "posted")));
  }

  // Job Quotes
  async createJobQuote(insertQuote: InsertJobQuote): Promise<JobQuote> {
    const [quote] = await db.insert(jobQuotes).values(insertQuote).returning();
    return quote;
  }

  async getJobQuotes(jobId: number): Promise<(JobQuote & { tradie: TradieProfile & { user: User } })[]> {
    const results = await db
      .select({
        id: jobQuotes.id,
        jobId: jobQuotes.jobId,
        tradieId: jobQuotes.tradieId,
        amount: jobQuotes.amount,
        description: jobQuotes.description,
        timeline: jobQuotes.timeline,
        status: jobQuotes.status,
        createdAt: jobQuotes.createdAt,
        tradie: tradieProfiles,
        user: users
      })
      .from(jobQuotes)
      .innerJoin(tradieProfiles, eq(jobQuotes.tradieId, tradieProfiles.id))
      .innerJoin(users, eq(tradieProfiles.userId, users.id))
      .where(eq(jobQuotes.jobId, jobId));

    return results.map(result => ({
      id: result.id,
      jobId: result.jobId,
      tradieId: result.tradieId,
      amount: result.amount,
      description: result.description,
      timeline: result.timeline,
      status: result.status,
      createdAt: result.createdAt,
      tradie: {
        ...result.tradie,
        user: result.user
      }
    }));
  }

  async getQuotesByTradie(tradieId: number): Promise<(JobQuote & { job: Job })[]> {
    const results = await db
      .select({
        id: jobQuotes.id,
        jobId: jobQuotes.jobId,
        tradieId: jobQuotes.tradieId,
        amount: jobQuotes.amount,
        description: jobQuotes.description,
        timeline: jobQuotes.timeline,
        status: jobQuotes.status,
        createdAt: jobQuotes.createdAt,
        job: jobs
      })
      .from(jobQuotes)
      .innerJoin(jobs, eq(jobQuotes.jobId, jobs.id))
      .where(eq(jobQuotes.tradieId, tradieId));

    return results.map(result => ({
      id: result.id,
      jobId: result.jobId,
      tradieId: result.tradieId,
      amount: result.amount,
      description: result.description,
      timeline: result.timeline,
      status: result.status,
      createdAt: result.createdAt,
      job: result.job
    }));
  }

  // Reviews
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async getReviewsByTradie(tradieId: number): Promise<(Review & { customer: User })[]> {
    const results = await db
      .select({
        id: reviews.id,
        tradieId: reviews.tradieId,
        customerId: reviews.customerId,
        jobId: reviews.jobId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        customer: users
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.customerId, users.id))
      .where(eq(reviews.tradieId, tradieId))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      id: result.id,
      tradieId: result.tradieId,
      customerId: result.customerId,
      jobId: result.jobId,
      rating: result.rating,
      comment: result.comment,
      createdAt: result.createdAt,
      customer: result.customer
    }));
  }

  // Work Photos
  async createWorkPhoto(insertPhoto: InsertWorkPhoto): Promise<WorkPhoto> {
    const [photo] = await db.insert(workPhotos).values(insertPhoto).returning();
    return photo;
  }

  async getWorkPhotosByTradie(tradieId: number): Promise<WorkPhoto[]> {
    return await db.select().from(workPhotos).where(eq(workPhotos.tradieId, tradieId));
  }

  // Messages
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getJobMessages(jobId: number): Promise<(Message & { sender: User; receiver: User })[]> {
    // For now, return empty array as this requires complex joins
    return [];
  }

  // Admin monitoring methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(dbUsers);
  }

  async getAllJobs(): Promise<(Job & { customer: User })[]> {
    const results = await db
      .select({
        id: dbJobs.id,
        customerId: dbJobs.customerId,
        assignedTradieId: dbJobs.assignedTradieId,
        title: dbJobs.title,
        description: dbJobs.description,
        category: dbJobs.category,
        location: dbJobs.location,
        postcode: dbJobs.postcode,
        budgetMin: dbJobs.budgetMin,
        budgetMax: dbJobs.budgetMax,
        timeline: dbJobs.timeline,
        status: dbJobs.status,
        images: dbJobs.images,
        createdAt: dbJobs.createdAt,
        customer: dbUsers
      })
      .from(dbJobs)
      .innerJoin(dbUsers, eq(dbJobs.customerId, dbUsers.id));

    return results.map(result => ({
      id: result.id,
      customerId: result.customerId,
      title: result.title,
      description: result.description,
      category: result.category,
      location: result.location,
      postcode: result.postcode,
      budgetMin: result.budgetMin,
      budgetMax: result.budgetMax,
      timeline: result.timeline,
      status: result.status,
      images: result.images,
      createdAt: result.createdAt,
      customer: result.customer
    }));
  }

  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(dbMessages);
  }

  async getUserConversations(userId: number): Promise<any[]> {
    try {
      const userMessages = await db.select().from(dbMessages)
        .where(eq(dbMessages.senderId, userId))
        .limit(100);
      return [];
    } catch {
      return [];
    }
  }

  async getConversationMessages(userId: number, participantId: number): Promise<any[]> {
    try {
      return await db.select().from(dbMessages)
        .where(eq(dbMessages.jobId, participantId))
        .limit(50);
    } catch {
      return [];
    }
  }

  async getAllContracts(): Promise<Contract[]> {
    // For now, return empty array as contracts aren't in database schema yet
    return [];
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
