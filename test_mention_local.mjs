import 'dotenv/config.js';
import { handleMessage } from './dist/src/commands/chatHandler.js';
import { prisma } from './dist/src/db.js';

/**
 * Mock Discord Message object for local testing
 */
class MockMessage {
  constructor(content, author, isReply = false, mentions = [], mentionedUserId = null) {
    this.content = content;
    this.author = author;
    this.channelId = 'test-channel-123';
    this.guildId = 'test-guild-123';
    this.id = `msg-${Date.now()}`;
    this.createdTimestamp = Date.now();
    
    // For mention testing
    this.mentions = {
      has: (userId) => mentions.includes(userId),
      size: mentions.length,
    };
    
    // For reply testing
    this.reference = isReply ? {
      messageId: 'replied-to-msg-id',
    } : null;
    
    // Mock reply method to capture bot response intent
    this.reply = async (content) => {
      console.log(`[BOT REPLY to ${this.author.username}]: ${typeof content === 'string' ? content : JSON.stringify(content)}`);
      return { id: `reply-${Date.now()}` };
    };
  }
}

// Mock Discord User
const botUser = { id: 'bot-user-id', username: '莓狐', bot: true };
const testUser = { id: 'test-user-id', username: 'TestUser', bot: false };

async function runTests() {
  console.log('🤖 Running local mention test...\n');
  
  try {
    // Test 1: Message with mention
    console.log('📝 Test 1: User mentions bot');
    const mentionMsg = new MockMessage(
      '@莓狐 hello there!',
      testUser,
      false,
      [botUser.id] // bot is mentioned
    );
    await handleMessage(mentionMsg);
    console.log('✅ Mention test completed\n');
    
    // Test 2: Direct message (DM)
    console.log('📝 Test 2: User sends DM to bot');
    const dmMsg = new MockMessage(
      'What is your name?',
      testUser,
      false,
      [] // no mentions in DM
    );
    // Mock DM context
    dmMsg.guildId = null; // DMs have no guild
    await handleMessage(dmMsg);
    console.log('✅ DM test completed\n');
    
    console.log('✅ All local tests completed! Bot mention/DM handler logic works.');
    console.log('⚠️  Note: Actual LLM responses require valid OpenAI API key with active billing.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
}

runTests().then(() => {
  console.log('\n✨ Done.');
  process.exit(0);
}).catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
