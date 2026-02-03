import { validateFunctionSpec } from '../src/services/specValidator.js';

describe('spec validator', () => {
  test('valid spec passes', () => {
    const s = { name: 'foo', parameters: { type: 'object', properties: { userId: { type: 'string' } }, required: ['userId'] } };
    expect(validateFunctionSpec(s)).toBe(true);
  });

  test('invalid spec missing name throws', () => {
    expect(() => validateFunctionSpec({} as any)).toThrow();
  });
});
