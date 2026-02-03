import { Message } from 'discord.js';
import { createConversation, addMessage, getRecentMessages } from '../services/db.js';
import { slidingWindowRateLimit, getRecentMessagesCache, setRecentMessages } from '../cache/redis.js';
import { chatWithModel } from '../services/llm.js';

export async function handleMessage(message: Message) {
  // Only handle direct messages, mentions, or replies in guild channels
  const isDM = !message.guild;
  const botId = message.client?.user?.id ?? null;
  const isMentioned = !!(message.mentions && botId && (message.mentions as any).users?.has?.(botId));
  const isReply = !!message.reference?.messageId;

  if (!isDM && !isMentioned && !isReply) return; // ignore non-directed messages in busy channels

  // choose conversation: DM => per-user, Reply => channel-level conversation, else => per-user in guild
  let conv: any;
  if (isDM) {
    conv = await createConversation('dm', message.author.id);
  } else if (isReply) {
    conv = await createConversation((message.channel as any).id);
  } else {
    conv = await createConversation(message.guild?.id ?? 'dm', message.author.id);
  }

  // try to include referenced message content into the conversation as context and decide reply target
  let targetReplyMessage: Message = message as any;
  if (isReply && message.reference?.messageId) {
    try {
      const ref = await (message.channel as any).messages.fetch(message.reference.messageId);
      const role = ref.author.id === botId ? 'assistant' : 'user';
      await addMessage(conv.id, role, `${ref.author.username}: ${ref.content}`);
      if (ref.author.id !== message.author.id) targetReplyMessage = ref;
    } catch (e: any) { /* ignore fetch errors */ }
  }

  // save user message
  await addMessage(conv.id, 'user', message.content);

  // rate limit per-user (sliding window)
  const rl = await slidingWindowRateLimit(message.author.id, 10, 60);
  if (!rl.ok) {
    await (targetReplyMessage as Message).reply(`速率限制: 已達上限（${rl.count}/${10}），請稍後再試。`);
    return;
  }

  // attempt to use cache for recent messages
  try {
    const cached = await getRecentMessagesCache(conv.id as number);
    if (cached) {
      // if cached, we still add new message and proceed
    }

    // call LLM service to get reply
    const reply = await chatWithModel(conv.id, message.content);
    if (reply) {
      // save assistant reply
      await addMessage(conv.id, 'assistant', reply);
      await setRecentMessages(conv.id as number, await getRecentMessages(conv.id as number, 10));
      await (targetReplyMessage as Message).reply(reply);
    } else {
      await (targetReplyMessage as Message).reply('抱歉，模型未產生回覆。');
    }
  } catch (err) {
    console.error('LLM error', err);
    await (targetReplyMessage as Message).reply('處理發生錯誤，請稍後再試。');
  }
}
