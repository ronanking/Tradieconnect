import { body, param, query, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Banking access logger middleware
export const bankingAccessLogger = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const timestamp = new Date().toISOString();
  
  console.log(`[BANKING-ACCESS] ${timestamp} - IP: ${clientIp}, Agent: ${userAgent}, Path: ${req.path}, Method: ${req.method}`);
  
  // Log user if authenticated
  if (req.user) {
    console.log(`[BANKING-USER] ${timestamp} - User: ${req.user.username} (ID: ${req.user.id}), Type: ${req.user.userType}`);
  }
  
  next();
};

// Password strength validation
export const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

// Email validation
export const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

// Input length limits
export const textValidation = (field: string, maxLength: number = 1000) => 
  body(field)
    .isLength({ max: maxLength })
    .withMessage(`${field} must not exceed ${maxLength} characters`)
    .trim()
    .escape();

// Numeric validation
export const numericValidation = (field: string, min: number = 0, max: number = 999999) =>
  body(field)
    .isNumeric()
    .withMessage(`${field} must be a valid number`)
    .isFloat({ min, max })
    .withMessage(`${field} must be between ${min} and ${max}`);

// ID parameter validation
export const idValidation = param('id')
  .isInt({ min: 1 })
  .withMessage('ID must be a positive integer');

// File upload validation
export const fileValidation = (field: string, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as any;
    if (files && files[field]) {
      const file = Array.isArray(files[field]) ? files[field][0] : files[field];
      
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
          error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
        });
      }
      
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ 
          error: 'File size must be less than 5MB' 
        });
      }
    }
    next();
  };
};

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Banking validation
export const bsbValidation = body('bsb')
  .matches(/^\d{3}-?\d{3}$/)
  .withMessage('BSB must be in format XXX-XXX');

export const accountNumberValidation = body('accountNumber')
  .matches(/^\d{6,10}$/)
  .withMessage('Account number must be 6-10 digits');

// Bank account validation
export const bankAccountValidation = [
  bsbValidation,
  accountNumberValidation,
  body('accountHolderName')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Account holder name must contain only letters, spaces, hyphens, and apostrophes'),
  body('bankName')
    .isLength({ min: 2, max: 50 })
    .trim()
    .escape(),
  body('accountType')
    .isIn(['savings', 'cheque'])
    .withMessage('Account type must be savings or cheque'),
  handleValidationErrors
];

// Banking information encryption utilities
export const encryptBankingData = (data: string): string => {
  const key = process.env.BANKING_ENCRYPTION_KEY || 'default-key-for-development-only-32';
  const cipher = crypto.createCipher('aes-256-cbc', key);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return encrypted;
};

export const decryptBankingData = (encryptedData: string): string => {
  const key = process.env.BANKING_ENCRYPTION_KEY || 'default-key-for-development-only-32';
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Mask sensitive banking information for security
export const maskBankingInfo = (bankAccount: any): any => {
  if (!bankAccount) return bankAccount;
  
  const masked = { ...bankAccount };
  
  if (masked.accountNumber) {
    const accNumber = masked.accountNumber;
    masked.accountNumber = '*'.repeat(Math.max(0, accNumber.length - 4)) + accNumber.slice(-4);
  }
  
  return masked;
};

// User registration validation
export const userRegistrationValidation = [
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage('Last name is required and must be less than 50 characters'),
  emailValidation,
  passwordValidation,
  body('userType')
    .isIn(['customer', 'tradie'])
    .withMessage('User type must be either customer or tradie'),
  handleValidationErrors
];

// Job posting validation
export const jobValidation = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Job title is required'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 2000 })
    .trim()
    .escape(),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('location')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 100 })
    .trim()
    .escape(),
  body('postcode')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^\d{4}$/)
    .withMessage('Postcode must be 4 digits'),
  body('timeline')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 50 }),
  handleValidationErrors
];

// Quote validation
export const quoteValidation = [
  body('amount')
    .isFloat({ min: 50, max: 100000 })
    .withMessage('Quote amount must be between $50 and $100,000'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .trim()
    .escape()
    .withMessage('Quote description must be between 10 and 1000 characters'),
  body('timeline')
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Timeline is required'),
  handleValidationErrors
];

// Message validation
export const messageValidation = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .trim()
    .escape()
    .withMessage('Message content is required and must be less than 2000 characters'),
  handleValidationErrors
];

// Password hashing utility
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // Higher than default for better security
  return await bcrypt.hash(password, saltRounds);
};

// Password verification utility
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// SQL injection prevention for dynamic queries
export const sanitizeForSQL = (input: string): string => {
  return input.replace(/['";\\]/g, ''); // Remove dangerous SQL characters
};

// XSS prevention utility
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Banking and financial information validation
export const creditCardValidation = body('cardNumber')
  .custom((value) => {
    // Remove spaces and dashes
    const cardNumber = value.replace(/[\s-]/g, '');
    
    // Check if it's a valid number
    if (!/^\d{13,19}$/.test(cardNumber)) {
      throw new Error('Invalid credit card number format');
    }
    
    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
      throw new Error('Invalid credit card number');
    }
    
    return true;
  });

export const expiryDateValidation = body('expiryDate')
  .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
  .withMessage('Expiry date must be in MM/YY format')
  .custom((value) => {
    const [month, year] = value.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    
    if (expiry < now) {
      throw new Error('Credit card has expired');
    }
    
    return true;
  });

export const cvvValidation = body('cvv')
  .matches(/^\d{3,4}$/)
  .withMessage('CVV must be 3 or 4 digits');

// Payment processing validation
export const paymentValidation = [
  creditCardValidation,
  expiryDateValidation,
  cvvValidation,
  body('cardholderName')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Cardholder name must contain only letters, spaces, hyphens, and apostrophes'),
  body('billingAddress.street')
    .isLength({ min: 5, max: 100 })
    .trim()
    .escape(),
  body('billingAddress.city')
    .isLength({ min: 2, max: 50 })
    .trim()
    .escape(),
  body('billingAddress.postcode')
    .matches(/^\d{4}$/)
    .withMessage('Postcode must be 4 digits'),
  body('billingAddress.state')
    .isIn(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'])
    .withMessage('Invalid Australian state'),
  handleValidationErrors
];

