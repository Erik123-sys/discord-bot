import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Zruší timeout používateľovi.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('Používateľ').setRequired(true)),
  requiredPermission: 'ModerateMembers',
  async execute(interaction, { sendLog }) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Používateľ nie je na serveri.', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: '❌ Tohto používateľa nemôžem unmutnúť.', ephemeral: true });

    await member.timeout(null, `Unmute: ${interaction.user.tag}`);
    await interaction.reply(`🔊 **${user.tag}** už nie je stlmený.`);
    await sendLog(interaction, 'UNMUTE', member, 'Timeout odstránený');
  }
};
