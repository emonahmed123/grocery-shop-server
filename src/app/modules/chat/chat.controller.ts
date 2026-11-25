import { pipeUIMessageStreamToResponse } from 'ai';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { ChatServices } from './chat.service';

// streams the reply as it is written, instead of the usual JSON response
const streamReply = catchAsync(async (req: Request, res: Response) => {
  // the customer closed the chat or the page: stop generating
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) controller.abort();
  });

  // errors before this point (bad messages, no API key) still go out as JSON
  const stream = await ChatServices.streamReply(req.body, controller.signal);

  // Express's version of `createUIMessageStreamResponse`, which returns a
  // web Response that Express cannot send
  pipeUIMessageStreamToResponse({ response: res, stream });
});

export const ChatControllers = {
  streamReply,
};
