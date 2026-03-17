import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

export const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

export const validatePost = [
  body('text')
    .optional()
    .isLength({ max: 3000 })
    .withMessage('Post cannot exceed 3000 characters'),
  body()
    .custom((value, { req }) => {
      if (!req.body.text && !req.file) {
        throw new Error('Post must contain text or image');
      }
      return true;
    })
];

export const validateComment = [
  body('text')
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

