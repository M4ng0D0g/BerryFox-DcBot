import { listApiEndpoints } from './db.js';
import { executeApi } from './apiExecutor.js';

export async function getFunctionsForModel() {
  // read ApiEndpoint specs from DB and convert to model functions
  const endpoints = await listApiEndpoints();
  return endpoints.map((e: any) => e.spec);
}

export async function executeFunctionByName(name: string, args: any) {
  return executeApi(name, args);
}
