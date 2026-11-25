import { UIMessage } from 'ai';

/** the body `useChat` from `@ai-sdk/react` sends */
export type TChatPayload = {
  /** the whole conversation so far, oldest first; the last one is the customer's */
  messages: UIMessage[];
};
