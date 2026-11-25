import { z } from 'zod';

// a customer may only send text, so no files or images reach the AI bill
const userMessageSchema = z.object({
  id: z.string(),
  role: z.literal('user'),
  parts: z
    .array(
      z.object({
        type: z.literal('text', {
          errorMap: () => ({ message: 'Only text messages are allowed' }),
        }),
        text: z
          .string()
          .trim()
          .min(1, { message: 'Message cannot be empty' })
          .max(1000, { message: 'Message is too long' }),
      }),
    )
    .min(1, { message: 'Message cannot be empty' }),
});

// the assistant's earlier replies come back as the stream sent them (text,
// tool calls, steps); the service checks those parts against the tools
const assistantMessageSchema = z.object({
  id: z.string(),
  role: z.literal('assistant'),
  parts: z.array(z.object({ type: z.string() }).passthrough()),
});

const streamReplyValidationSchema = z.object({
  body: z.object({
    messages: z
      // no 'system' role: the instructions only come from the server
      .array(
        z.discriminatedUnion('role', [
          userMessageSchema,
          assistantMessageSchema,
        ]),
        {
          required_error: 'messages is required',
        },
      )
      .min(1, { message: 'Send at least one message' })
      // keeps each request (and the AI bill) small
      .max(20, {
        message: 'The conversation is too long, please start a new one',
      })
      .refine((messages) => messages[messages.length - 1]?.role === 'user', {
        message: 'The last message must be from the user',
      }),
  }),
});

export const chatValidationSchemas = {
  streamReplyValidationSchema,
};
