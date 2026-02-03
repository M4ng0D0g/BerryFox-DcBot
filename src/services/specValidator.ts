export function validateFunctionSpec(spec: any) {
  if (!spec || typeof spec !== 'object') throw new Error('spec must be an object');
  if (!spec.name || typeof spec.name !== 'string') throw new Error('spec.name required');
  if (spec.parameters && typeof spec.parameters !== 'object') throw new Error('spec.parameters must be an object');
  // minimal JSON schema check for parameters
  const params = spec.parameters?.properties ?? {};
  for (const [k, v] of Object.entries(params)) {
    const vv: any = v;
    if (!vv || typeof vv !== 'object' || !('type' in vv)) throw new Error(`parameter ${k} must have a type`);
  }
  return true;
}
