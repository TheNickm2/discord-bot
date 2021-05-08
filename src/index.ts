import * as dotenv from 'dotenv';
import { Client as DiscordClient, Message } from 'discord.js';
import * as Commands from './commands/Commands';

dotenv.config();

const Client = new DiscordClient();

Client.once('ready', () => {
    console.info(`Logged in as ${Client.user ? Client.user.tag : 'a bot'}`);
});

Client.on('message', (msg: Message): void => {
    // handle message stuff here
});

Client.login(process.env.BOT_TOKEN);
