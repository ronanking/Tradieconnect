import type { Express } from "express";
import { body, validationResult } from "express-validator";
import { storage } from "./storage";
import { insertInvoiceSchema } from "@shared/schema";

export function registerInvoiceRoutes(app: Express) {
  
  // Create Invoice
  app.post("/api/invoices", 
    [
      body('jobId').isInt({ min: 1 }).withMessage('Valid job ID required'),
      body('quoteId').optional().isInt({ min: 1 }).withMessage('Valid quote ID required'),
      body('subtotal').isFloat({ min: 0 }).withMessage('Valid subtotal required'),
      body('totalAmount').isFloat({ min: 0 }).withMessage('Valid total amount required'),
      body('description').notEmpty().withMessage('Invoice description required'),
      body('paymentTerms').optional().isIn(['Net 7', 'Net 14', 'Net 30', 'Due on receipt']).withMessage('Valid payment terms required'),
      body('paymentMethods').optional().isArray().withMessage('Payment methods must be an array'),
      body('lineItems').optional().isArray().withMessage('Line items must be an array'),
      body('dueDate').optional().isISO8601().withMessage('Valid due date required'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user || req.user.userType !== 'tradie') {
        return res.status(403).json({ message: "Access denied. Tradies only." });
      }

      try {
        // Get tradie profile
        const tradieProfile = await storage.getTradieProfile(req.user.id);
        if (!tradieProfile) {
          return res.status(404).json({ message: "Tradie profile not found" });
        }

        // Verify job access
        const job = await storage.getJob(req.body.jobId);
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }

        // Calculate GST (10% for Australia)
        const subtotal = parseFloat(req.body.subtotal);
        const gstAmount = subtotal * 0.1;
        const totalAmount = subtotal + gstAmount;

        // Create invoice data
        const invoiceData = {
          ...req.body,
          customerId: job.customerId,
          tradieId: tradieProfile.id,
          subtotal: subtotal.toString(),
          gstAmount: gstAmount.toString(),
          totalAmount: totalAmount.toString(),
        };

        const invoice = await storage.createInvoice(invoiceData);
        res.status(201).json(invoice);

      } catch (error: any) {
        console.error("Invoice creation error:", error);
        res.status(500).json({ message: "Failed to create invoice" });
      }
    }
  );

  // Get Invoices for Tradie
  app.get("/api/invoices/tradie", async (req, res) => {
    if (!req.user || req.user.userType !== 'tradie') {
      return res.status(403).json({ message: "Access denied. Tradies only." });
    }

    try {
      const tradieProfile = await storage.getTradieProfile(req.user.id);
      if (!tradieProfile) {
        return res.status(404).json({ message: "Tradie profile not found" });
      }

      const invoices = await storage.getInvoicesByTradie(tradieProfile.id);
      res.json(invoices);

    } catch (error: any) {
      console.error("Tradie invoices fetch error:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get Invoices for Customer
  app.get("/api/invoices/customer", async (req, res) => {
    if (!req.user || req.user.userType !== 'customer') {
      return res.status(403).json({ message: "Access denied. Customers only." });
    }

    try {
      const invoices = await storage.getInvoicesByCustomer(req.user.id);
      res.json(invoices);

    } catch (error: any) {
      console.error("Customer invoices fetch error:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get Single Invoice
  app.get("/api/invoices/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Verify access rights
      const hasAccess = invoice.customerId === req.user.id || 
                       (req.user.userType === 'tradie' && invoice.tradieId === req.user.id);

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Mark as viewed if customer is viewing for the first time
      if (req.user.userType === 'customer' && !invoice.viewedAt) {
        await storage.markInvoiceAsViewed(invoiceId);
      }

      res.json(invoice);

    } catch (error: any) {
      console.error("Invoice fetch error:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // Send Invoice to Customer
  app.post("/api/invoices/:id/send", async (req, res) => {
    if (!req.user || req.user.userType !== 'tradie') {
      return res.status(403).json({ message: "Access denied. Tradies only." });
    }

    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Verify tradie owns this invoice
      const tradieProfile = await storage.getTradieProfile(req.user.id);
      if (!tradieProfile || invoice.tradieId !== tradieProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedInvoice = await storage.sendInvoice(invoiceId);
      res.json(updatedInvoice);

    } catch (error: any) {
      console.error("Invoice send error:", error);
      res.status(500).json({ message: "Failed to send invoice" });
    }
  });

  // Mark Invoice as Paid
  app.post("/api/invoices/:id/mark-paid", async (req, res) => {
    if (!req.user || req.user.userType !== 'tradie') {
      return res.status(403).json({ message: "Access denied. Tradies only." });
    }

    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Verify tradie owns this invoice
      const tradieProfile = await storage.getTradieProfile(req.user.id);
      if (!tradieProfile || invoice.tradieId !== tradieProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedInvoice = await storage.markInvoiceAsPaid(invoiceId);
      res.json(updatedInvoice);

    } catch (error: any) {
      console.error("Invoice mark paid error:", error);
      res.status(500).json({ message: "Failed to mark invoice as paid" });
    }
  });

  // Update Invoice
  app.put("/api/invoices/:id", 
    [
      body('subtotal').optional().isFloat({ min: 0 }).withMessage('Valid subtotal required'),
      body('description').optional().notEmpty().withMessage('Invoice description required'),
      body('paymentTerms').optional().isIn(['Net 7', 'Net 14', 'Net 30', 'Due on receipt']).withMessage('Valid payment terms required'),
      body('paymentMethods').optional().isArray().withMessage('Payment methods must be an array'),
      body('lineItems').optional().isArray().withMessage('Line items must be an array'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user || req.user.userType !== 'tradie') {
        return res.status(403).json({ message: "Access denied. Tradies only." });
      }

      try {
        const invoiceId = parseInt(req.params.id);
        const invoice = await storage.getInvoice(invoiceId);
        
        if (!invoice) {
          return res.status(404).json({ message: "Invoice not found" });
        }

        // Verify tradie owns this invoice
        const tradieProfile = await storage.getTradieProfile(req.user.id);
        if (!tradieProfile || invoice.tradieId !== tradieProfile.id) {
          return res.status(403).json({ message: "Access denied" });
        }

        // Can't edit sent or paid invoices
        if (invoice.status !== 'draft') {
          return res.status(400).json({ message: "Can only edit draft invoices" });
        }

        // Recalculate totals if subtotal changed
        let updateData = { ...req.body };
        if (req.body.subtotal) {
          const subtotal = parseFloat(req.body.subtotal);
          const gstAmount = subtotal * 0.1;
          const totalAmount = subtotal + gstAmount;
          
          updateData = {
            ...updateData,
            gstAmount: gstAmount.toString(),
            totalAmount: totalAmount.toString(),
          };
        }

        const updatedInvoice = await storage.updateInvoice(invoiceId, updateData);
        res.json(updatedInvoice);

      } catch (error: any) {
        console.error("Invoice update error:", error);
        res.status(500).json({ message: "Failed to update invoice" });
      }
    }
  );

  // Delete Invoice (Draft only)
  app.delete("/api/invoices/:id", async (req, res) => {
    if (!req.user || req.user.userType !== 'tradie') {
      return res.status(403).json({ message: "Access denied. Tradies only." });
    }

    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Verify tradie owns this invoice
      const tradieProfile = await storage.getTradieProfile(req.user.id);
      if (!tradieProfile || invoice.tradieId !== tradieProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Can only delete draft invoices
      if (invoice.status !== 'draft') {
        return res.status(400).json({ message: "Can only delete draft invoices" });
      }

      await storage.deleteInvoice(invoiceId);
      res.json({ message: "Invoice deleted successfully" });

    } catch (error: any) {
      console.error("Invoice delete error:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });
}