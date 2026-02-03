import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import type { APIApplicationCommandOption } from 'discord-api-types/v10';
import * as dotenv from 'dotenv';

dotenv.config();
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID || process.env.BOT_CLIENT_ID;
const guildId = process.env.GUILD_ID;
if (!token || !clientId || !guildId) {
  console.error('TOKEN, CLIENT_ID and GUILD_ID must be set in .env');
  process.exit(1);
}

const commands: any[] = [
  {
    name: 'persona-create',
    description: 'Create a persona',
    options: [
      { name: 'name', description: 'persona name', type: 3, required: true },
      { name: 'prompt', description: 'system prompt for persona', type: 3, required: true },
    ] as APIApplicationCommandOption[],
  },
  {
    name: 'persona-list',
    description: 'List personas',
  },
  {
    name: 'endpoint-create',
    description: 'Create an ApiEndpoint',
    options: [
      { name: 'name', description: 'endpoint name', type: 3, required: true },
      { name: 'description', description: 'description', type: 3, required: false },
      { name: 'spec', description: 'function spec (JSON)', type: 3, required: true },
    ] as APIApplicationCommandOption[],
  },
  {
    name: 'embeddings-index',
    description: 'Index text as embedding',
    options: [
      { name: 'ref_type', description: 'ref type', type: 3, required: true },
      { name: 'ref_id', description: 'ref id', type: 4, required: true },
      { name: 'text', description: 'text to index', type: 3, required: true },
    ] as APIApplicationCommandOption[],
  },
  {
    name: 'embeddings-batch-index',
    description: 'Index multiple texts (separate by ||)',
    options: [
      { name: 'ref_type', description: 'ref type', type: 3, required: true },
      { name: 'ref_id', description: 'ref id', type: 4, required: true },
      { name: 'texts', description: 'texts separated by ||', type: 3, required: true },
    ] as APIApplicationCommandOption[],
  },
  {
    name: 'persona-delete',
    description: 'Delete a persona',
    options: [{ name: 'name', description: 'persona name', type: 3, required: true } as APIApplicationCommandOption],
  },
  {
    name: 'endpoint-update',
    description: 'Update an ApiEndpoint spec',
    options: [
      { name: 'name', description: 'endpoint name', type: 3, required: true },
      { name: 'spec', description: 'function spec (JSON)', type: 3, required: true },
    ] as APIApplicationCommandOption[],
  },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Registering commands...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('Commands registered');
  } catch (e) {
    console.error('Failed to register commands', e);
    process.exit(1);
  }
})();
