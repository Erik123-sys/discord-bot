import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Zabanuje používateľa.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName('user').setDescription('Používateľ').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Dôvod').setRequired(false)),
  requiredPermission: 'BanMembers',
  async execute(interaction, { sendLog }) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Neuvedený dôvod';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Používateľ nie je na serveri.', ephemeral: true });
    if (!member.bannable) return interaction.reply({ content: '❌ Tohto používateľa nemôžem zabanovať (rola/opravenia).', ephemeral: true });
    if (member.id === interaction.user.id) return interaction.reply({ content: '❌ Nemôžeš zabanovať seba.', ephemeral: true });
    await member.ban({ reason });
    await interaction.reply(`🔨 **${user.tag}** bol zabanovaný.\nDôvod: ${reason}`);
    await sendLog(interaction, 'BAN', member, reason);
  }
};
