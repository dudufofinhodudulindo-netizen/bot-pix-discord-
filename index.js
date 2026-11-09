require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Saldo inicial da carteira
let saldo = 0;

const comandos = [
  new SlashCommandBuilder()
    .setName('saldo')
    .setDescription('Consultar saldo compartilhado'),

  new SlashCommandBuilder()
    .setName('adicionarsaldo')
    .setDescription('Adicionar saldo (administrador)')
    .addNumberOption(option =>
      option.setName('valor')
        .setDescription('Valor em reais')
        .setRequired(true)
        .setMinValue(0.01)
    )
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`Bot conectado: ${client.user.tag}`);

  const rest = new REST({ version: '10' })
    .setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: comandos }
  );

  console.log('Comandos registrados!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'saldo') {
    return interaction.reply(
      `💰 Saldo compartilhado: R$ ${saldo.toFixed(2)}`
    );
  }

  if (interaction.commandName === 'adicionarsaldo') {
    if (interaction.user.id !== process.env.ADMIN_ID) {
      return interaction.reply({
        content: '❌ Você não tem permissão.',
        ephemeral: true
      });
    }

    const valor = interaction.options.getNumber('valor');
    saldo = Math.round((saldo + valor) * 100) / 100;

    return interaction.reply(
      `✅ Adicionado R$ ${valor.toFixed(2)}. Saldo: R$ ${saldo.toFixed(2)}`
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
