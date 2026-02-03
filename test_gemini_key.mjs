import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
console.log('Testing Gemini API key:', apiKey ? '✓ Key exists' : '✗ No key');

if (!apiKey) {
  console.error('❌ GOOGLE_GEMINI_API_KEY not set in .env');
  process.exit(1);
}

try {
  const client = new GoogleGenerativeAI(apiKey);
  
  // Try to list available models
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
  const data = await response.json();
  
  if (data.models) {
    console.log('\n✅ API key is valid!');
    console.log('\nAvailable models:');
    data.models.forEach(m => {
      if (m.name.includes('gemini')) {
        console.log('  -', m.name);
      }
    });
  } else {
    console.error('❌ API Error:', data);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
