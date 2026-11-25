import type { UIMessage } from 'ai' with { 'resolution-mode': 'import' };
import httpStatus from 'http-status';
import { z } from 'zod';
import config from '../../config';
import AppError from '../../error/AppError';
import { Category } from '../Category/category.model';
import { Product } from '../Products/products.model';
import { getCurrentPrice } from '../Products/products.utils';
import { TChatPayload } from './chat.interface';
import { loadAiSdk, TAiSdk } from './chat.sdk';

// set GEMINI_MODEL in .env to switch models without a code change
const CHAT_MODEL = config.gemini_model || 'gemini-3.5-flash-lite';

const INSTRUCTIONS = `You name is babo ai  You are the shopping assistant of an online Borobazar shop.
- Help customers find products, compare prices, check what is on sale and plan meals or shopping lists.
- Always use the tools to look up products, prices, stock and categories. Never make up a product, price or offer.
- Prices are in US dollars, e.g. $4.50. Mention the unit (e.g. 1kg, 500ml).
- If a product is out of stock, say so and suggest a similar one that is in stock.
- You cannot place, change or cancel orders, or see a customer's orders or account. For that, send them to the "My Orders" page or the shop's support.
- Answer only questions about the shop, groceries, cooking and food. Politely decline anything else.
- Keep answers short and friendly. Reply in the language the customer writes in.`;

// model calls per reply: searches, then the answer
const MAX_STEPS = 5;

const escapeRegex = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// built once the AI SDK has loaded (see chat.sdk.ts)
const buildTools = (tool: TAiSdk['tool']) => ({
  searchProducts: tool({
    description:
      'Search the shop for products by name, tag or category. Returns up to 8 products with their current price and stock.',
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe('Words to search for, e.g. "milk" or "basmati rice"'),
      category: z
        .string()
        .optional()
        .describe('Only products in this category'),
      maxPrice: z
        .number()
        .optional()
        .describe('Only products that cost at most this much right now'),
      onSaleOnly: z
        .boolean()
        .optional()
        .describe('Only products that are discounted or on a flash sale'),
    }),
    execute: async ({ query, category, maxPrice, onSaleOnly }) => {
      const filter: Record<string, unknown> = {
        isDeleted: false,
        isAvailable: true,
      };

      if (query?.trim()) {
        const pattern = new RegExp(escapeRegex(query.trim()), 'i');
        filter.$or = [
          { name: pattern },
          { tags: pattern },
          { category: pattern },
          { description: pattern },
        ];
      }
      if (category?.trim()) {
        filter.category = new RegExp(escapeRegex(category.trim()), 'i');
      }

      const products = await Product.find(filter)
        .select(
          'name slug unit price salePrice maxPrice category inStock averageRating flashSale',
        )
        .sort('-ratingCount')
        .limit(40)
        .lean();

      return products
        .map((product) => {
          const { price, isFlashSale } = getCurrentPrice(product);
          return {
            name: product.name,
            slug: product.slug,
            unit: product.unit,
            price,
            regularPrice: product.price,
            onSale: price < product.price,
            isFlashSale,
            inStock: product.inStock > 0,
            category: product.category,
            rating: product.averageRating,
          };
        })
        .filter(
          (product) => maxPrice === undefined || product.price <= maxPrice,
        )
        .filter((product) => !onSaleOnly || product.onSale)
        .slice(0, 8);
    },
  }),

  listCategories: tool({
    description: 'List the product categories the shop sells.',
    inputSchema: z.object({}),
    execute: async () => {
      const categories = await Category.find({ isDeleted: false })
        .select('name slug children')
        .lean();

      return categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        subCategories: category.children?.map((child) => child.name) ?? [],
      }));
    },
  }),
});

let chatTools: ReturnType<typeof buildTools> | undefined;

const streamReply = async (payload: TChatPayload, abortSignal: AbortSignal) => {
  if (!config.google_ai_api_key) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'The chat assistant is not set up yet',
    );
  }

  const { ai, google } = await loadAiSdk();
  const {
    convertToModelMessages,
    isStepCount,
    smoothStream,
    streamText,
    toUIMessageStream,
    validateUIMessages,
  } = ai;
  const model = google.createGoogleGenerativeAI({
    apiKey: config.google_ai_api_key,
  })(CHAT_MODEL);
  chatTools ??= buildTools(ai.tool);
  const tools = chatTools;

  let messages: UIMessage[];
  try {
    messages = await validateUIMessages({ messages: payload.messages, tools });
  } catch (err) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid chat messages: ${(err as Error).message}`,
    );
  }

  const result = streamText({
    model,

    instructions: INSTRUCTIONS,
    messages: await convertToModelMessages(messages, {
      tools,
      ignoreIncompleteToolCalls: true,
    }),
    tools,

    stopWhen: isStepCount(MAX_STEPS),
    // the last step may not search again, so the customer always gets an answer
    // instead of the reply ending after the searches with no text
    prepareStep: ({ stepNumber }) =>
      stepNumber >= MAX_STEPS - 1 ? { toolChoice: 'none' } : undefined,
    maxOutputTokens: 800,
    // Gemini sends the text in big bursts; this lets it appear word by word
    experimental_transform: smoothStream({ chunking: 'word', delayInMs: 20 }),

    abortSignal,
  });

  return toUIMessageStream({
    stream: result.stream,
    tools,
    originalMessages: messages,
    onError: (err) => {
      console.error('Chat assistant failed:', err);
      return 'The chat assistant could not answer right now, please try again';
    },
  });
};

export const ChatServices = {
  streamReply,
};
