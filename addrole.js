import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Pridá používateľovi rolu.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(o => o.setName('user').setDescription('Používateľ').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Rola').setRequired(true)),
  requiredPermission: 'ManageRoles',
  async execute(interaction) {
    const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id).catch(() => null);
    const role = interaction.options.getRole('role');

    if (!member) return interaction.reply({ content: '❌ Používateľ nie je na serveri.', ephemeral: true });
    if (role.id === interaction.guild.id) return interaction.reply({ content: '❌ @everyone nemôže byť pridelená týmto príkazom.', ephemeral: true });

    const me = interaction.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ Bot nemá oprávnenie **Manage Roles**.', ephemeral: true });
    }
    if (role.position >= me.roles.highest.position) {
      return interaction.reply({ content: '❌ Táto rola je vyššie alebo rovnako vysoko ako moja najvyššia rola.', ephemeral: true });
    }
    if (member.roles.cache.has(role.id)) {
      return interaction.reply({ content: 'ℹ️ Používateľ už túto rolu má.', ephemeral: true });
    }

    await member.roles.add(role, `Pridal ${interaction.user.tag}`);
    await interaction.reply(`✅ Rola ${role} bola pridelená používateľovi **${member.user.tag}**.`);
  }
};
