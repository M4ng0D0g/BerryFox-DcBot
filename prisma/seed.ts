import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultPersona = await prisma.persona.upsert({
    where: { name: 'default' },
    update: {},
    create: {
      name: 'default',
      systemPrompt: 'You are a helpful, concise, and safe assistant. Always be polite and follow the project safety guidelines.',
    },
  });

  // optional example guild/user
  const guild = await prisma.guild.upsert({
    where: { id: 'local-guild' },
    update: {},
    create: { id: 'local-guild', name: 'Local Dev Guild' },
  });

  // create a test user for function-calling demos
  await prisma.user.upsert({
    where: { id: 'test-user-1' },
    update: {},
    create: { id: 'test-user-1', username: 'TestUser' },
  });

  // create a simple ApiEndpoint for demo (getUser)
  const getUserSpec = {
    name: 'getUser',
    description: 'Retrieve user details by ID',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' }
      },
      required: ['userId']
    }
  };
  await prisma.apiEndpoint.upsert({
    where: { name: 'getUser' },
    update: {},
    create: {
      name: 'getUser',
      description: 'Return a user by id',
      spec: JSON.stringify(getUserSpec)
    }
  });

  console.log('Seed done:', { persona: defaultPersona.name, guild: guild.id });
  // note: more endpoints can be added via prisma studio
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
