import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Odbanuje používateľa podľa ID.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(o => o.setName('user_id').setDescription('Discord ID používateľa').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Dôvod').setRequired(false)),
  requiredPermission: 'BanMembers',
  async execute(interaction, { sendLog }) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'Neuvedený dôvod';

    const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
    if (!ban) return interaction.reply({ content: '❌ Tento používateľ nie je v ban liste alebo ID je nesprávne.', ephemeral: true });

    await interaction.guild.members.unban(userId, reason);
    await interaction.reply(`🔓 **${ban.user.tag}** bol odbanovaný.\nDôvod: ${reason}`);
    await sendLog(interaction, 'UNBAN', ban.user, reason);
  }
};
