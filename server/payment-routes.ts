import type { Express } from "express";
import { body, validationResult } from "express-validator";
import { storage } from "./storage";
import { 
  bankAccountValidation, 
  handleValidationErrors, 
  encryptBankingData, 
  decryptBankingData,
  maskBankingInfo,
  bankingAccessLogger 
} from "./middleware/validation";
import { insertTradieBankAccountSchema } from "@shared/schema";

export function registerPaymentRoutes(app: Express) {
  
  // Banking Setup Route
  app.post("/api/banking/setup", 
    bankingAccessLogger,
    bankAccountValidation,
    handleValidationErrors,
    async (req, res) => {
      if (!req.user || req.user.userType !== 'tradie') {
        return res.status(403).json({ message: "Access denied. Tradies only." });
      }

      try {
        // Get tradie profile
        const tradieProfile = await storage.getTradieProfile(req.user.id);
        if (!tradieProfile) {
          return res.status(404).json({ message: "Tradie profile not found" });
        }

        // Validate and encrypt banking data
        const { accountHolderName, bsb, accountNumber, bankName, accountType } = req.body;
        
        // Encrypt sensitive data
        const encryptedAccountNumber = encryptBankingData(accountNumber);
        
        // Check if bank account already exists
        const existingAccount = await storage.getTradieBankAccount(tradieProfile.id);
        
        let bankAccount;
        if (existingAccount) {
          // Update existing account
          bankAccount = await storage.updateTradieBankAccount(tradieProfile.id, {
            accountHolderName,
            bsb,
            accountNumber: encryptedAccountNumber,
            bankName,
            accountType,
            isVerified: false, // Reset verification when details change
            verificationDate: null
          });
        } else {
          // Create new account
          bankAccount = await storage.createTradieBankAccount({
            tradieId: tradieProfile.id,
            accountHolderName,
            bsb,
            accountNumber: encryptedAccountNumber,
            bankName,
            accountType
          });
        }

        // Return masked data for security
        const maskedAccount = maskBankingInfo(bankAccount);
        res.json(maskedAccount);

      } catch (error: any) {
        console.error("Banking setup error:", error);
        res.status(500).json({ message: "Failed to save banking details" });
      }
    }
  );

  // Get Banking Information
  app.get("/api/banking/account", 
    bankingAccessLogger,
    async (req, res) => {
      if (!req.user || req.user.userType !== 'tradie') {
        return res.status(403).json({ message: "Access denied. Tradies only." });
      }

      try {
        const tradieProfile = await storage.getTradieProfile(req.user.id);
        if (!tradieProfile) {
          return res.status(404).json({ message: "Tradie profile not found" });
        }

        const bankAccount = await storage.getTradieBankAccount(tradieProfile.id);
        if (!bankAccount) {
          return res.status(404).json({ message: "No banking information found" });
        }

        // Return masked banking info for security
        const maskedAccount = maskBankingInfo(bankAccount);
        res.json(maskedAccount);

      } catch (error: any) {
        console.error("Get banking info error:", error);
        res.status(500).json({ message: "Failed to retrieve banking information" });
      }
    }
  );

  // Verify Bank Account
  app.post("/api/banking/verify", 
    bankingAccessLogger,
    async (req, res) => {
      if (!req.user || req.user.userType !== 'tradie') {
        return res.status(403).json({ message: "Access denied. Tradies only." });
      }

      try {
        const tradieProfile = await storage.getTradieProfile(req.user.id);
        if (!tradieProfile) {
          return res.status(404).json({ message: "Tradie profile not found" });
        }

        const bankAccount = await storage.getTradieBankAccount(tradieProfile.id);
        if (!bankAccount) {
          return res.status(404).json({ message: "No banking information found. Please set up your bank account first." });
        }

        // In a real implementation, this would:
        // 1. Use a service like Stripe Connect or bank API to verify account
        // 2. Make micro-deposits for verification
        // 3. Validate BSB and account number format
        
        // For demo purposes, we'll simulate verification
        const verifiedAccount = await storage.verifyBankAccount(tradieProfile.id);
        
        const maskedAccount = maskBankingInfo(verifiedAccount!);
        res.json({ 
          message: "Bank account verified successfully",
          account: maskedAccount 
        });

      } catch (error: any) {
        console.error("Bank verification error:", error);
        res.status(500).json({ message: "Failed to verify bank account" });
      }
    }
  );

  // Process Payment (Customer pays tradie)
  app.post("/api/payments/process",
    bankingAccessLogger,
    [
      body('quoteId').isInt({ min: 1 }).withMessage('Valid quote ID required'),
      body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid amount required'),
      body('paymentMethod').isIn(['credit_card', 'bank_transfer']).withMessage('Valid payment method required')
    ],
    handleValidationErrors,
    async (req, res) => {
      if (!req.user || req.user.userType !== 'customer') {
        return res.status(403).json({ message: "Access denied. Customers only." });
      }

      try {
        const { quoteId, amount, paymentMethod } = req.body;
        
        // Get quote details
        const quotes = await storage.getJobQuotes(0); // This needs to be improved to get by quote ID
        const quote = quotes.find(q => q.id === quoteId);
        if (!quote) {
          return res.status(404).json({ message: "Quote not found" });
        }

        // Get job details
        const job = await storage.getJob(quote.jobId);
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }

        // Verify tradie has verified banking information
        const bankAccount = await storage.getTradieBankAccount(quote.tradieId);
        if (!bankAccount || !bankAccount.isVerified) {
          return res.status(400).json({ 
            message: "Tradie must set up and verify their bank account before receiving payments" 
          });
        }

        // No platform fees - tradies keep 100% of earnings
        const totalAmount = parseFloat(amount);
        const platformFee = 0;
        const tradieAmount = totalAmount;

        // Create payment transaction
        const transaction = await storage.createPaymentTransaction({
          jobId: job.id,
          quoteId: quote.id,
          customerId: req.user.id,
          tradieId: quote.tradieId,
          totalAmount: totalAmount.toString(),
          platformFee: platformFee.toString(),
          tradieAmount: tradieAmount.toString(),
          stripePaymentIntentId: null,
          stripeTransferId: null,
          paymentMethod,
          failureReason: null,
          refundReason: null,
          refundAmount: null,
          metadata: null
        });

        // In a real implementation, this would:
        // 1. Process payment through Stripe
        // 2. Transfer funds to tradie's bank account via Stripe Connect
        // 3. Handle webhooks for payment status updates
        
        // For demo purposes, simulate successful payment
        await storage.updatePaymentTransaction(transaction.id, {
          status: "completed",
          paymentDate: new Date().toISOString(),
          transferDate: new Date().toISOString(),
          stripePaymentIntentId: `pi_demo_${Date.now()}`,
          stripeTransferId: `tr_demo_${Date.now()}`
        });

        // No platform earnings to record with subscription model
        // Platform revenue comes from subscription fees, not transaction fees

        // Update job status to in_progress
        await storage.updateJob(job.id, { status: "in_progress", acceptedBy: quote.tradieId });

        res.json({
          message: "Payment processed successfully",
          transactionId: transaction.id,
          tradieAmount: tradieAmount,
          platformFee: platformFee
        });

      } catch (error: any) {
        console.error("Payment processing error:", error);
        res.status(500).json({ message: "Failed to process payment" });
      }
    }
  );

  // Get Payment History for Tradie
  app.get("/api/payments/tradie-history", 
    bankingAccessLogger,
    async (req, res) => {
      if (!req.user || req.user.userType !== 'tradie') {
        return res.status(403).json({ message: "Access denied. Tradies only." });
      }

      try {
        const tradieProfile = await storage.getTradieProfile(req.user.id);
        if (!tradieProfile) {
          return res.status(404).json({ message: "Tradie profile not found" });
        }

        const payments = await storage.getPaymentsByTradie(tradieProfile.id);
        
        // Add job and customer details to each payment
        const enrichedPayments = await Promise.all(
          payments.map(async (payment) => {
            const job = await storage.getJob(payment.jobId);
            const customer = await storage.getUser(payment.customerId);
            return {
              ...payment,
              job: job ? { title: job.title, description: job.description } : null,
              customer: customer ? { firstName: customer.firstName, lastName: customer.lastName } : null
            };
          })
        );

        res.json(enrichedPayments);

      } catch (error: any) {
        console.error("Get payment history error:", error);
        res.status(500).json({ message: "Failed to retrieve payment history" });
      }
    }
  );

  // Get Payment History for Customer  
  app.get("/api/payments/customer-history", 
    bankingAccessLogger,
    async (req, res) => {
      if (!req.user || req.user.userType !== 'customer') {
        return res.status(403).json({ message: "Access denied. Customers only." });
      }

      try {
        const payments = await storage.getPaymentsByCustomer(req.user.id);
        
        // Add job and tradie details to each payment
        const enrichedPayments = await Promise.all(
          payments.map(async (payment) => {
            const job = await storage.getJob(payment.jobId);
            const tradieProfile = await storage.getTradieProfileById(payment.tradieId);
            const tradieUser = tradieProfile ? await storage.getUser(tradieProfile.userId) : null;
            
            return {
              ...payment,
              job: job ? { title: job.title, description: job.description } : null,
              tradie: tradieProfile && tradieUser ? { 
                tradeName: tradieProfile.tradeName,
                userName: `${tradieUser.firstName} ${tradieUser.lastName}`
              } : null
            };
          })
        );

        res.json(enrichedPayments);

      } catch (error: any) {
        console.error("Get payment history error:", error);
        res.status(500).json({ message: "Failed to retrieve payment history" });
      }
    }
  );

  // Create Payment Dispute
  app.post("/api/payments/dispute",
    bankingAccessLogger,
    [
      body('transactionId').isInt({ min: 1 }).withMessage('Valid transaction ID required'),
      body('disputeType').isIn(['quality', 'non_completion', 'overcharge', 'other']).withMessage('Valid dispute type required'),
      body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
    ],
    handleValidationErrors,
    async (req, res) => {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      try {
        const { transactionId, disputeType, description, evidence } = req.body;
        
        // Verify transaction exists and user is involved
        const transaction = await storage.getPaymentTransaction(transactionId);
        if (!transaction) {
          return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.customerId !== req.user.id && transaction.tradieId !== req.user.id) {
          return res.status(403).json({ message: "Access denied. You are not involved in this transaction." });
        }

        // Create dispute
        const dispute = await storage.createPaymentDispute({
          transactionId,
          initiatedBy: req.user.id,
          disputeType,
          description,
          evidence: evidence || []
        });

        res.json({
          message: "Payment dispute created successfully",
          dispute: dispute
        });

      } catch (error: any) {
        console.error("Create dispute error:", error);
        res.status(500).json({ message: "Failed to create payment dispute" });
      }
    }
  );
}