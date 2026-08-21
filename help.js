import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Zobrazí zoznam príkazov.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel),
  requiredPermission: 'ViewChannel',
  async execute(interaction) {
    await interaction.reply(
      '🛡️ **Moderation Bot**\n\n' +
      '`/ban` – ban\n' +
      '`/unban` – unban podľa ID\n' +
      '`/kick` – kick\n' +
      '`/mute` – timeout\n' +
      '`/unmute` – zrušenie timeoutu\n' +
      '`/addrole` – pridanie role\n' +
      '`/removerole` – odobratie role\n' +
      '`/help` – pomoc'
    );
  }
};
