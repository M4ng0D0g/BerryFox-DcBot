import { prisma } from '../db.js';

export async function createApiEndpoint(name: string, description: string | null, spec: any) {
  return prisma.apiEndpoint.create({ data: { name, description, spec } });
}

export async function deleteApiEndpoint(name: string) {
  return prisma.apiEndpoint.delete({ where: { name } });
}

export async function listApiEndpoints() {
  return prisma.apiEndpoint.findMany();
}
