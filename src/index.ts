import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';

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
client.once('ready', () => {
    console.log(`機器人已上線！登入帳號為 ${client.user?.tag}`);
});

// 簡單的訊息回應測試
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content === 'ping') {
        message.reply('pong!');
    }
});

// 登入機器人
client.login(process.env.TOKEN);