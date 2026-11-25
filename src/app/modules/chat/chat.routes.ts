import { Router } from 'express';
import validateRequest from '../../middleware/validateRequest';
import { ChatControllers } from './chat.controller';
import { chatValidationSchemas } from './chat.validation';

const router = Router();

// open to every visitor; the client (useChat) sends the conversation each
// time and gets the reply as a stream
router.post(
  '/',
  validateRequest(chatValidationSchemas.streamReplyValidationSchema),
  ChatControllers.streamReply,
);

export const ChatRoutes = router;
