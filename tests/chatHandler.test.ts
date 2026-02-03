import { jest } from '@jest/globals';

jest.mock('../src/services/db.js', () => ({
  createConversation: jest.fn(async (g: string, u?: string) => ({ id: Math.floor(Math.random() * 1000) })),
  addMessage: jest.fn(async () => ({})),
  getRecentMessages: jest.fn(async () => []),
}));

jest.mock('../src/cache/redis.js', () => ({
  slidingWindowRateLimit: jest.fn(async () => ({ ok: true, count: 0 })),
  getRecentMessagesCache: jest.fn(async () => null),
  setRecentMessages: jest.fn(async () => ({})),
}));

jest.mock('../src/services/llm.js', () => ({
  chatWithModel: jest.fn(async () => 'bot reply'),
}));

let handleMessage: any;
beforeEach(async () => {
  // ensure llm test override is set before loading handler
  const llm = await import('../src/services/llm.js');
  llm.testHelpers.chatOverride = async () => 'bot reply';
  ({ handleMessage } = await import('../src/commands/chatHandler.js'));
});

afterEach(async () => {
  const llm = await import('../src/services/llm.js');
  llm.testHelpers.chatOverride = null;
});

describe('chatHandler', () => {
  test('responds when bot is mentioned in guild channel', async () => {
    const mock = {
      guild: { id: 'g1' },
      channel: { id: 'c1', messages: { fetch: jest.fn() } },
      client: { user: { id: 'botid' } },
      author: { id: 'u1', username: 'u1' },
      content: 'hello',
      mentions: { users: new Map([['botid', true]]), has: (id: string) => id === 'botid' },
      reply: (jest.fn() as jest.Mock<any>).mockResolvedValue(undefined),
    } as any;

    await handleMessage(mock);
    expect(mock.reply).toHaveBeenCalledWith('bot reply');
  });

  test('when replying to another user, includes referenced message in context and replies to that message', async () => {
    const ref = {
      author: { id: 'other', username: 'other' },
      content: 'previous',
      reply: (jest.fn() as jest.Mock<any>).mockResolvedValue(undefined),
    } as any;

    const mock = {
      guild: { id: 'g1' },
      channel: { id: 'c1', messages: { fetch: jest.fn(async (id: string) => ref) } },
      client: { user: { id: 'botid' } },
      author: { id: 'u2', username: 'u2' },
      content: 'what about that previous message?',
      mentions: { users: new Map(), has: () => false },
      reference: { messageId: 'm1' },
      reply: (jest.fn() as jest.Mock<any>).mockResolvedValue(undefined),
    } as any;

    await handleMessage(mock);
    expect(ref.reply).toHaveBeenCalledWith('bot reply');
  });

  test('DMs always get a response', async () => {
    const mock = {
      guild: undefined,
      channel: { id: 'dm1', messages: { fetch: jest.fn() } },
      client: { user: { id: 'botid' } },
      author: { id: 'u3', username: 'u3' },
      content: 'hi in dm',
      mentions: { users: new Map(), has: () => false },
      reply: (jest.fn() as jest.Mock<any>).mockResolvedValue(undefined),
    } as any;

    await handleMessage(mock);
    expect(mock.reply).toHaveBeenCalledWith('bot reply');
  });
});
