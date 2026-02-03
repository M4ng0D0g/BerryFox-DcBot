import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { handleMessage } from './commands/chatHandler.js';

// 載入 .env 檔案
dotenv.config();

// 建立機器人客戶端
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// 當機器人準備就緒時觸發
client.once('ready', async () => {
    console.log(`機器人已上線！登入帳號為 ${client.user?.tag}`);

    // start optional monitor server if enabled
    if (process.env.ENABLE_MONITOR === 'true') {
      import('./monitor/server.js').then((m) => m.startMonitor());
    }

    // init embeddings (pgvector if enabled)
    try { await (await import('./services/embeddings.js')).initEmbeddings(); } catch (e: any) { console.warn('emb init error', e?.message ?? e); }

    // load handler scaffolds and compiled handlers
    try { await (await import('./services/handlerLoader.js')).loadHandlers(); } catch (e: any) { console.warn('handler load error', e?.message ?? e); }
});

// 簡單的訊息回應測試
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === 'ping') {
        await message.reply('pong!');
        return;
    }

    // Send non-command messages to the chat handler (saves to DB)
    try {
        await handleMessage(message);
    } catch (err) {
        console.error('chat handler error', err);
    }
});

// interaction handling (slash commands)
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand && interaction.isChatInputCommand()) {
      const { handleInteraction } = await import('./commands/adminHandler.js');
      await handleInteraction(interaction);
    } else if ((interaction as any).isButton && (interaction as any).isButton()) {
      const { handleComponent } = await import('./commands/adminHandler.js');
      await handleComponent(interaction as any);
    }
  } catch (e) {
    console.error('interaction error', e);
  }
});

// 登入機器人
client.login(process.env.TOKEN);