import 'dotenv/config';
const llm = await import('../dist/src/services/llm.js');
llm.testHelpers.chatOverride = async (conversationId, userMessage) => {
  return `OVERRIDE_REPLY: ${userMessage}`;
};
const m = await import('../dist/src/commands/chatHandler.js');
const handleMessage = m.handleMessage;

const msg = {
  guild: { id: 'g1' },
  client: { user: { id: 'bot-123' } },
  mentions: {
    users: new Map([['bot-123', true]]),
    has(id) { return this.users.has(id); }
  },
  author: { id: 'user-1', username: 'Tester' },
  content: '<@bot-123> hello',
  reference: null,
  channel: { id: 'c1' },
  reply: async (t) => { console.log('REPLY:', t); return; }
};

try {
  await handleMessage(msg);
  console.log('handleMessage finished');
} catch (e) {
  console.error('handleMessage error', e);
  process.exit(1);
}
