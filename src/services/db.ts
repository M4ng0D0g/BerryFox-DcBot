import { prisma } from '../db.js';

export async function createPersona(name: string, systemPrompt: string, config?: any) {
  return prisma.persona.create({ data: { name, systemPrompt, config } });
}

export async function findPersonaByName(name: string) {
  return prisma.persona.findUnique({ where: { name } });
}

export async function createConversation(guildId: string, userId?: string, personaId?: number) {
  // Ensure related Guild and User exist to avoid foreign key violations when creating conversations
  const data: any = {
    personaId,
    // Create an empty conversation that connects or creates the guild
    guild: {
      connectOrCreate: {
        where: { id: guildId },
        create: { id: guildId },
      },
    },
  };
  if (userId) {
    data.user = {
      connectOrCreate: {
        where: { id: userId },
        create: { id: userId },
      },
    };
  }
  return prisma.conversation.create({ data });
}

export async function addMessage(conversationId: number, role: string, content: string) {
  return prisma.message.create({ data: { conversationId, role, content } });
}

export async function getRecentMessages(conversationId: number, limit = 20) {
  return prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'desc' }, take: limit });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function listApiEndpoints() {
  return prisma.apiEndpoint.findMany({});
}

export async function logApiCall(endpointId: number, input: any, output: any) {
  return prisma.apiCallLog.create({ data: { endpointId, input, output } });
}

export async function findApiEndpointByName(name: string) {
  return prisma.apiEndpoint.findUnique({ where: { name } });
}

export async function createApiEndpoint(name: string, description: string | null, spec: any) {
  return prisma.apiEndpoint.create({ data: { name, description, spec } });
}

export async function deletePersona(name: string) {
  return prisma.persona.delete({ where: { name } });
}

export async function saveEmbedding(refType: string, refId: number, vector: number[]) {
  return prisma.embedding.create({ data: { refType, refId, vector: JSON.stringify(vector) } as any });
}

export async function getEmbeddingsByType(refType: string) {
  return prisma.embedding.findMany({ where: { refType } });
}
