import type { Interaction } from 'discord.js';

function requireAdmin(interaction: Interaction) {
  try {
    const member = (interaction as any).member;
    if (!member || !member.permissions) return false;
    return member.permissions.has('Administrator');
  } catch (e: any) { return false; }
}

export async function handleInteraction(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;
  const name = interaction.commandName;

  if (!requireAdmin(interaction)) {
    await interaction.reply({ content: 'You need Administrator permissions to use this command.', ephemeral: true });
    return;
  }

  if (name === 'persona-create') {
    const n = interaction.options.getString('name', true);
    const p = interaction.options.getString('prompt', true);
    const { createPersona } = await import('../services/db.js');
    const res = await createPersona(n, p);
    await interaction.reply({ content: `Persona ${res.name} created.`, ephemeral: true });
    return;
  }

  if (name === 'persona-list') {
    const { prisma } = await import('../db.js');
    const list = await prisma.persona.findMany();
    // build buttons for each persona (admin-only actions)
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
    const rows: any[] = [];
    for (const p of list) {
      const btn = new ButtonBuilder().setCustomId(`persona_delete:${p.name}`).setLabel(`Delete ${p.name}`).setStyle(ButtonStyle.Danger);
      rows.push(new ActionRowBuilder().addComponents(btn));
    }
    await interaction.reply({ content: 'Personas (click to delete):', components: rows, ephemeral: false });
    return;
  }

  if (name === 'endpoint-create') {
    const n = interaction.options.getString('name', true);
    const desc = interaction.options.getString('description', false) ?? '';
    const specStr = interaction.options.getString('spec', true);
    let spec = null;
    try { spec = JSON.parse(specStr); } catch (e) { await interaction.reply({ content: 'Invalid JSON for spec', ephemeral: true }); return; }
    const { createApiEndpoint } = await import('../services/admin.js');
    const ep = await createApiEndpoint(n, desc, spec);
    await interaction.reply({ content: `Endpoint ${ep.name} created.`, ephemeral: true });
    return;
  }

  if (name === 'endpoint-update') {
    const n = interaction.options.getString('name', true);
    const specStr = interaction.options.getString('spec', true);
    let spec = null;
    try { spec = JSON.parse(specStr); } catch (e) { await interaction.reply({ content: 'Invalid JSON for spec', ephemeral: true }); return; }
    const { deleteApiEndpoint, createApiEndpoint } = await import('../services/admin.js');
    try { await deleteApiEndpoint(n); } catch (e) {}
    const ep = await createApiEndpoint(n, '', spec);
    await interaction.reply({ content: `Endpoint ${ep.name} updated.`, ephemeral: true });
    return;
  }

  if (name === 'endpoint-list') {
    const { listApiEndpoints } = await import('../services/admin.js');
    const list = await listApiEndpoints();
    await interaction.reply({ content: 'Endpoints:\n' + list.map((x: any) => `${x.name} - ${x.description ?? ''}`).join('\n'), ephemeral: true });
    return;
  }

  if (name === 'endpoint-delete') {
    const n = interaction.options.getString('name', true);
    const { deleteApiEndpoint } = await import('../services/admin.js');
    const res = await deleteApiEndpoint(n);
    await interaction.reply({ content: `Deleted: ${n}`, ephemeral: true });
    return;
  }

  if (name === 'embeddings-index') {
    const refType = interaction.options.getString('ref_type', true);
    const refId = interaction.options.getInteger('ref_id', true) as number;
    const text = interaction.options.getString('text', true);
    const { indexText } = await import('../services/embeddings.js');
    await indexText(refType, refId, text);
    await interaction.reply({ content: 'Indexed text.', ephemeral: true });
    return;
  }

  if (name === 'embeddings-batch-index') {
    const refType = interaction.options.getString('ref_type', true);
    const refId = interaction.options.getInteger('ref_id', true) as number;
    const texts = interaction.options.getString('texts', true) || '';
    const items = texts.split('||').map((s) => s.trim()).filter(Boolean);
    const { indexText } = await import('../services/embeddings.js');
    for (const t of items) await indexText(refType, refId, t);
    await interaction.reply({ content: `Indexed ${items.length} texts.`, ephemeral: true });
    return;
  }

  if (name === 'embeddings-status') {
    const { getEmbeddingsByType } = await import('../services/db.js');
    const type = interaction.options.getString('ref_type', false) ?? 'default';
    const rows = await getEmbeddingsByType(type);
    await interaction.reply({ content: `Found ${rows.length} embeddings for ${type}`, ephemeral: true });
    return;
  }

  if (name === 'embeddings-migrate') {
    // trigger server-side migration script (just run the script once)
    const { exec } = await import('child_process');
    exec('npm run migrate:embeddings', (err, stdout, stderr) => {
      // don't block; just inform user
    });
    await interaction.reply({ content: 'Triggered migration job (check logs).', ephemeral: true });
    return;
  }
}

export async function handleComponent(interaction: any) {
  // handle button presses (persona delete)
  if (!interaction.isButton?.()) return;
  const id = interaction.customId || '';
  if (id.startsWith('persona_delete:')) {
    const name = id.split(':')[1];
    // require admin
    try {
      const member = (interaction as any).member;
      if (!member || !member.permissions || !member.permissions.has('Administrator')) {
        await interaction.reply({ content: 'Administrator required.', ephemeral: true });
        return;
      }
    } catch (e) { }

    try {
      const { deletePersona } = await import('../services/db.js');
      await deletePersona(name);
      await interaction.update({ content: `Persona ${name} deleted.`, components: [] });
    } catch (e) {
      await interaction.reply({ content: `Failed to delete ${name}: ${String(e)}`, ephemeral: true });
    }
  }
}
