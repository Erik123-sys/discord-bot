import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

function parseDuration(input) {
  const match = /^(\d+)(s|m|h|d)$/i.exec(input);
  if (!match) return null;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const ms = value * multipliers[unit];
  if (ms < 1000 || ms > 28 * 86400000) return null;
  return ms;
}

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Dočasne stlmí používateľa.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('Používateľ').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('Napr. 10m, 2h, 1d').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Dôvod').setRequired(false)),
  requiredPermission: 'ModerateMembers',
  async execute(interaction, { sendLog }) {
    const user = interaction.options.getUser('user');
    const durationInput = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'Neuvedený dôvod';
    const duration = parseDuration(durationInput);

    if (!duration) {
      return interaction.reply({ content: '❌ Čas musí byť napr. `10m`, `2h` alebo `1d` (max. 28 dní).', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Používateľ nie je na serveri.', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: '❌ Tohto používateľa nemôžem mutnúť.', ephemeral: true });

    await member.timeout(duration, reason);
    await interaction.reply(`🔇 **${user.tag}** bol stlmený na **${durationInput}**.\nDôvod: ${reason}`);
    await sendLog(interaction, 'MUTE', member, reason);
  }
};
