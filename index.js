import 'dotenv/config';
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  PermissionsBitField
} from 'discord.js';
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import config from './config.json' with { type: 'json' };

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN is missing in .env');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = await import(pathToFileURL(path.resolve('./commands', file)));
  client.commands.set(command.default.data.name, command.default);
}

async function sendLog(interaction, action, target, reason) {
  if (!config.logChannelId) return;
  const channel = await interaction.guild.channels.fetch(config.logChannelId).catch(() => null);
  if (!channel?.isTextBased()) return;
  await channel.send({
    content:
      `🛡️ **${action}**\n` +
      `Moderátor: ${interaction.user.tag}\n` +
      `Používateľ: ${target.user?.tag ?? target.tag ?? target.id}\n` +
      `Dôvod: ${reason || 'Neuvedený'}`
  }).catch(() => {});
}

client.once(Events.ClientReady, readyClient => {
  console.log(`✅ Bot online ako ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: '❌ Tento príkaz funguje iba na serveri.', ephemeral: true });
    }

    const required = command.requiredPermission;
    if (required && !interaction.memberPermissions?.has(required)) {
      return interaction.reply({
        content: `❌ Nemáš oprávnenie **${required}** na použitie tohto príkazu.`,
        ephemeral: true
      });
    }

    await command.execute(interaction, {
      config,
      sendLog,
      PermissionsBitField
    });
  } catch (error) {
    console.error(`Command ${interaction.commandName} failed:`, error);
    const message = '❌ Pri vykonávaní príkazu nastala chyba.';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: message, ephemeral: true }).catch(() => {});
    }
  }
});

client.on(Events.Error, console.error);

client.login(token);
