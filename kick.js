import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Vyhodí používateľa zo servera.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o => o.setName('user').setDescription('Používateľ').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Dôvod').setRequired(false)),
  requiredPermission: 'KickMembers',
  async execute(interaction, { sendLog }) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Neuvedený dôvod';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Používateľ nie je na serveri.', ephemeral: true });
    if (member.id === interaction.user.id) return interaction.reply({ content: '❌ Nemôžeš vyhodiť seba.', ephemeral: true });
    if (!member.kickable) return interaction.reply({ content: '❌ Tohto používateľa nemôžem kicknúť (rola/opravenia).', ephemeral: true });
    await member.kick(reason);
    await interaction.reply(`👢 **${user.tag}** bol vyhodený.\nDôvod: ${reason}`);
    await sendLog(interaction, 'KICK', member, reason);
  }
};
