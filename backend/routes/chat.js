import { Router } from 'express';
import { body } from 'express-validator';
import { rateLimit } from 'express-rate-limit';
import {
  getChatHistory,
  getChat,
  sendMessage,
  deleteChat,
  renameChat,
  getAvailableModels,
} from '../controllers/chatController.js';
import auth from '../middleware/auth.js';

const router = Router();

// Stricter rate limit for AI messages
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: { error: 'Too many messages, please slow down.' },
});

const messageValidation = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
  body('chatId').optional().isMongoId().withMessage('Invalid chat ID'),
];

router.use(auth);

router.get('/models', getAvailableModels);
router.get('/history', getChatHistory);
router.get('/:chatId', getChat);
router.post('/', messageLimiter, messageValidation, sendMessage);
router.delete('/:chatId', deleteChat);
router.put('/:chatId/title', renameChat);

export default router;
