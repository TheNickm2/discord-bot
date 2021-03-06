import * as dotenv from 'dotenv';
import {
    Client as DiscordClient,
    Message,
    MessageReaction,
    User
} from 'discord.js';
import ParseCommand from './commands/Commands';
import * as ReactionManager from './utils/Reaction';
import * as Database from './database/db';

dotenv.config();

const Client = new DiscordClient();

Client.once('ready', async () => {
    await Database.InitializeDatabase(
        `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    );

    console.info(`Logged in as ${Client.user ? Client.user.tag : 'a bot'}`);
    Client.user!.setPresence({
        activity: {
            type: 'PLAYING',
            name: "ESO in Kynareth's Garden"
        }
    });
    try {
        const channel = await Client.channels.fetch('840397677892337705');
        const guild = await Client.guilds.fetch('839564201855811624');
        if (channel && channel.isText()) {
            await channel.messages.fetch();
            const msg = channel.messages.cache.get('840693870827405404');
            if (msg) {
                ReactionManager.watchReactions(
                    msg,
                    Client,
                    guild,
                    async (reaction: MessageReaction, user: User) => {
                        const adminChannel = await Client.channels.fetch(
                            '840387782215204894'
                        );
                        if (adminChannel && adminChannel.isText()) {
                            adminChannel.send(
                                `<@&840384407415554068> - ${user.toString()} is requesting a **${
                                    reaction.emoji.name
                                }** assessment!`
                            );
                            user.send(
                                `Your **${reaction.emoji.name.toUpperCase()}** assessment request has been made in **${
                                    guild.name
                                }**!`
                            );
                        }
                    }
                );
            }
        }
    } catch (err) {
        console.error(err.message);
    }
});

Client.on('message', (msg: Message): void => {
    ParseCommand(msg, Client);
});

Client.login(process.env.BOT_TOKEN);
