import 'dotenv/config.js';
import { createTextEmbedding } from './dist/src/services/llm.js';

console.log('🔍 Testing OpenAI API Key...');
console.log('API Key set:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.slice(0, 10)}...` : 'NOT SET');

try {
  const embedding = await createTextEmbedding('test key validation');
  console.log('✅ API key is VALID! Successfully created embedding.');
  console.log('Vector sample (first 5 values):', embedding.slice(0, 5));
} catch (error) {
  console.error('❌ API key test FAILED:', error.message);
  process.exit(1);
}
