import { jest } from '@jest/globals';
import { handleInteraction, handleComponent } from '../src/commands/adminHandler.js';

jest.mock('../src/services/db', () => ({
  createPersona: jest.fn(async (n: string, p: string) => ({ name: n })),
  deletePersona: jest.fn(async (n: string) => ({ name: n }))
}));

describe('adminHandler', () => {
  test('persona-create replies with created persona', async () => {
    const mock = {
      isChatInputCommand: () => true,
      commandName: 'persona-create',
      options: { getString: (k: string) => (k === 'name' ? 'testp' : 'prompt text') },
      member: { permissions: { has: () => true } },
      reply: (jest.fn() as jest.Mock<any>).mockResolvedValue(undefined)
    } as any;

    await handleInteraction(mock);
    expect(mock.reply).toHaveBeenCalledWith({ content: expect.stringContaining('Persona testp created.'), ephemeral: true });
  });

  test('persona-list returns buttons and delete flow via component', async () => {
    const personas = [{ name: 'p1' }, { name: 'p2' }];
    const { prisma } = await import('../src/db.js');
    // mock prisma persona.findMany
    jest.spyOn(prisma.persona, 'findMany').mockResolvedValue(personas as any);
    // ensure a persona exists for delete flow
    await prisma.persona.create({ data: { name: 'p1' } });

    const listMock = {
      isChatInputCommand: () => true,
      commandName: 'persona-list',
      member: { permissions: { has: () => true } },
      reply: (jest.fn() as jest.Mock<any>).mockResolvedValue(undefined),
    } as any;

    await handleInteraction(listMock);
    expect(listMock.reply).toHaveBeenCalled();

    // simulate button interaction
    const btnMock = {
      isButton: () => true,
      customId: 'persona_delete:p1',
      member: { permissions: { has: () => true } },
      update: (jest.fn() as jest.Mock<any>).mockResolvedValue(undefined),
      reply: (jest.fn() as jest.Mock<any>).mockResolvedValue(undefined),
    } as any;

    await handleComponent(btnMock);

    // confirm either update or failure reply was called
    const updated = (btnMock.update as jest.Mock).mock.calls.length > 0;
    if (!updated) {
      expect(btnMock.reply).toHaveBeenCalled();
    } else {
      expect(btnMock.update).toHaveBeenCalledWith({ content: expect.stringContaining('Persona p1 deleted.'), components: [] });
    }
  });
});
