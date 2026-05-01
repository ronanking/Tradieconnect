import type { Express } from "express";
import { body, validationResult } from "express-validator";
import { storage } from "./storage";
import { 
  handleValidationErrors, 
  bankingAccessLogger 
} from "./middleware/validation";
import { insertPaymentScheduleSchema } from "@shared/schema";

export function registerPaymentScheduleRoutes(app: Express) {
  
  // Create Payment Schedule
  app.post("/api/payment-schedules/create",
    bankingAccessLogger,
    [
      body('quoteId').isInt({ min: 1 }).withMessage('Valid quote ID required'),
      body('numberOfPayments').isInt({ min: 2, max: 12 }).withMessage('Number of payments must be between 2 and 12'),
      body('frequency').isIn(['weekly', 'bi-weekly', 'monthly']).withMessage('Valid frequency required'),
      body('startDate').isISO8601().withMessage('Valid start date required')
    ],
    handleValidationErrors,
    async (req, res) => {
      if (!req.user || req.user.userType !== 'customer') {
        return res.status(403).json({ message: "Access denied. Customers only." });
      }

      try {
        const { quoteId, numberOfPayments, frequency, startDate, description } = req.body;
        
        // Get quote details to verify ownership and get total amount
        const quotes = await storage.getJobQuotes(0); // This needs improvement
        const quote = quotes.find(q => q.id === quoteId);
        if (!quote) {
          return res.status(404).json({ message: "Quote not found" });
        }

        // Verify the customer owns the job
        const job = await storage.getJob(quote.jobId);
        if (!job || job.customerId !== req.user.id) {
          return res.status(403).json({ message: "Access denied. You can only create payment schedules for your own jobs." });
        }

        // Check if payment schedule already exists for this quote
        const existingSchedule = await storage.getPaymentScheduleByQuote(quoteId);
        if (existingSchedule) {
          return res.status(400).json({ message: "Payment schedule already exists for this quote" });
        }

        // Create payment schedule
        const schedule = await storage.createPaymentSchedule({
          quoteId,
          customerId: req.user.id,
          tradieId: quote.tradieId,
          totalAmount: quote.price,
          numberOfPayments,
          frequency,
          startDate: new Date(startDate).toISOString(),
          description: description || null
        });

        // Generate individual scheduled payments
        const paymentAmount = parseFloat(quote.price) / numberOfPayments;
        const scheduledPayments = [];
        
        for (let i = 0; i < numberOfPayments; i++) {
          const dueDate = new Date(startDate);
          
          switch (frequency) {
            case 'weekly':
              dueDate.setDate(dueDate.getDate() + (i * 7));
              break;
            case 'bi-weekly':
              dueDate.setDate(dueDate.getDate() + (i * 14));
              break;
            case 'monthly':
              dueDate.setMonth(dueDate.getMonth() + i);
              break;
          }

          const payment = await storage.createScheduledPayment({
            scheduleId: schedule.id,
            amount: paymentAmount.toFixed(2),
            dueDate: dueDate.toISOString()
          });
          
          scheduledPayments.push(payment);
        }

        res.json({
          message: "Payment schedule created successfully",
          schedule: {
            ...schedule,
            payments: scheduledPayments
          }
        });

      } catch (error: any) {
        console.error("Payment schedule creation error:", error);
        res.status(500).json({ message: "Failed to create payment schedule" });
      }
    }
  );

  // Get Payment Schedules for Customer
  app.get("/api/payment-schedules",
    bankingAccessLogger,
    async (req, res) => {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      try {
        let schedules;
        
        if (req.user.userType === 'customer') {
          schedules = await storage.getPaymentSchedulesByCustomer(req.user.id);
        } else if (req.user.userType === 'tradie') {
          const tradieProfile = await storage.getTradieProfile(req.user.id);
          if (!tradieProfile) {
            return res.status(404).json({ message: "Tradie profile not found" });
          }
          schedules = await storage.getPaymentSchedulesByTradie(tradieProfile.id);
        } else {
          return res.status(403).json({ message: "Access denied" });
        }

        res.json(schedules);

      } catch (error: any) {
        console.error("Payment schedules fetch error:", error);
        res.status(500).json({ message: "Failed to fetch payment schedules" });
      }
    }
  );

  // Process Individual Payment
  app.post("/api/payment-schedules/process-payment",
    bankingAccessLogger,
    [
      body('scheduleId').isInt({ min: 1 }).withMessage('Valid schedule ID required'),
      body('paymentId').isInt({ min: 1 }).withMessage('Valid payment ID required'),
      body('paymentMethod').isIn(['credit_card', 'bank_transfer']).withMessage('Valid payment method required')
    ],
    handleValidationErrors,
    async (req, res) => {
      if (!req.user || req.user.userType !== 'customer') {
        return res.status(403).json({ message: "Access denied. Customers only." });
      }

      try {
        const { scheduleId, paymentId, paymentMethod } = req.body;
        
        // Get payment schedule and verify ownership
        const schedule = await storage.getPaymentSchedule(scheduleId);
        if (!schedule || schedule.customerId !== req.user.id) {
          return res.status(404).json({ message: "Payment schedule not found" });
        }

        // Get specific scheduled payment
        const payment = await storage.getScheduledPayment(paymentId);
        if (!payment || payment.scheduleId !== scheduleId) {
          return res.status(404).json({ message: "Scheduled payment not found" });
        }

        // Check if payment is due and not already paid
        if (payment.status !== 'pending') {
          return res.status(400).json({ message: "Payment has already been processed" });
        }

        if (new Date(payment.dueDate) > new Date()) {
          return res.status(400).json({ message: "Payment is not yet due" });
        }

        // No platform fees with subscription model
        const paymentAmount = parseFloat(payment.amount);
        const platformFee = 0;
        const tradieAmount = paymentAmount;

        // In a real implementation, this would integrate with Stripe or similar
        // For now, we'll simulate payment processing
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Update scheduled payment status
        const updatedPayment = await storage.updateScheduledPayment(paymentId, {
          status: 'paid',
          paidAt: new Date().toISOString(),
          paymentMethod,
          transactionId
        });

        // Create payment transaction record
        const transaction = await storage.createPaymentTransaction({
          jobId: 0, // This would need to be linked properly
          quoteId: schedule.quoteId,
          customerId: req.user.id,
          tradieId: schedule.tradieId,
          totalAmount: paymentAmount.toString(),
          platformFee: platformFee.toString(),
          tradieAmount: tradieAmount.toString(),
          stripePaymentIntentId: transactionId,
          stripeTransferId: null,
          paymentMethod,
          failureReason: null,
          refundReason: null,
          refundAmount: null,
          metadata: JSON.stringify({ 
            type: 'scheduled_payment',
            scheduleId: scheduleId,
            paymentId: paymentId 
          })
        });

        // No platform earnings to record with subscription model
        // Platform revenue comes from subscription fees, not transaction fees

        // Check if all payments in schedule are completed
        const allPayments = await storage.getScheduledPaymentsBySchedule(scheduleId);
        const completedPayments = allPayments.filter(p => p.status === 'paid');
        
        if (completedPayments.length === allPayments.length) {
          // Mark schedule as completed
          await storage.updatePaymentSchedule(scheduleId, { status: 'completed' });
        } else if (completedPayments.length === 1) {
          // Mark schedule as active after first payment
          await storage.updatePaymentSchedule(scheduleId, { status: 'active' });
        }

        res.json({
          message: "Payment processed successfully",
          payment: updatedPayment,
          transaction: {
            id: transaction.id,
            amount: paymentAmount,
            platformFee: platformFee,
            tradieAmount: tradieAmount
          }
        });

      } catch (error: any) {
        console.error("Payment processing error:", error);
        res.status(500).json({ message: "Failed to process payment" });
      }
    }
  );

  // Cancel Payment Schedule
  app.post("/api/payment-schedules/:scheduleId/cancel",
    bankingAccessLogger,
    async (req, res) => {
      if (!req.user || req.user.userType !== 'customer') {
        return res.status(403).json({ message: "Access denied. Customers only." });
      }

      try {
        const scheduleId = parseInt(req.params.scheduleId);
        
        // Get payment schedule and verify ownership
        const schedule = await storage.getPaymentSchedule(scheduleId);
        if (!schedule || schedule.customerId !== req.user.id) {
          return res.status(404).json({ message: "Payment schedule not found" });
        }

        // Check if schedule can be cancelled
        if (schedule.status === 'completed') {
          return res.status(400).json({ message: "Cannot cancel completed payment schedule" });
        }

        // Check if any payments have been made
        const payments = await storage.getScheduledPaymentsBySchedule(scheduleId);
        const paidPayments = payments.filter(p => p.status === 'paid');
        
        if (paidPayments.length > 0) {
          return res.status(400).json({ 
            message: "Cannot cancel payment schedule with completed payments. Contact support for assistance." 
          });
        }

        // Cancel schedule and all pending payments
        await storage.updatePaymentSchedule(scheduleId, { status: 'cancelled' });
        
        for (const payment of payments) {
          if (payment.status === 'pending') {
            await storage.updateScheduledPayment(payment.id, { status: 'cancelled' });
          }
        }

        res.json({
          message: "Payment schedule cancelled successfully"
        });

      } catch (error: any) {
        console.error("Payment schedule cancellation error:", error);
        res.status(500).json({ message: "Failed to cancel payment schedule" });
      }
    }
  );

  // Get Payment Schedule Details
  app.get("/api/payment-schedules/:scheduleId",
    bankingAccessLogger,
    async (req, res) => {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      try {
        const scheduleId = parseInt(req.params.scheduleId);
        
        const schedule = await storage.getPaymentScheduleWithDetails(scheduleId);
        if (!schedule) {
          return res.status(404).json({ message: "Payment schedule not found" });
        }

        // Verify access rights
        const hasAccess = req.user.userType === 'customer' && schedule.customerId === req.user.id ||
                         req.user.userType === 'tradie' && schedule.tradieId === req.user.id;

        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }

        res.json(schedule);

      } catch (error: any) {
        console.error("Payment schedule details error:", error);
        res.status(500).json({ message: "Failed to fetch payment schedule details" });
      }
    }
  );
}