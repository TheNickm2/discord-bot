import { Client as DiscordClient, Message } from 'discord.js';
import * as Database from '../database/db';

export default function ParseCommand(
    Message: Message,
    Client: DiscordClient
): void {
    const prefix: string = process.env.PREFIX!;
    if (Message.content.startsWith(prefix)) {
        const command = Message.content.substring(1).split(' ')[0];
        const params = Message.content.replace(`${prefix}${command} `, '').split(' ');
        if (command) {
            switch (command) {
                case 'allowrequests':
                case 'enablerequests':
                case 'allow': {
                    removeUserFromDatabase(Message, Client, params);
                    break;
                }
            }
        }
    }
}

function removeUserFromDatabase(message: Message, client: DiscordClient, params: string[]) {
    const mention = message.mentions.members!.first();
    if (mention) {
        const userId = mention.id;
        Database.DeleteGuildmate(userId).then(responseCode => {
            switch(responseCode) {
                case Database.DeleteCode.Success:
                    message.channel.send(`${mention.toString()} was successfully removed from the database. They will once again be allowed to request assessments.`);
                    return;
                case Database.DeleteCode.UserNotFound:
                    message.channel.send(`${mention.toString()} was not in the database. They are already allowed to request assessments.`);
                    return;
                case Database.DeleteCode.DatabaseFailure:
                    message.channel.send(`Failed to remove ${mention.toString()} from the database. I'm not really sure why, someone should poke <@441377078634610688>`);
                    return;
                default:
                    message.channel.send(`Failed to remove ${mention.toString()} from the database. I'm not really sure why, someone should poke <@441377078634610688>`);
                    return;
            }
        }).catch(error => {
            if (error) console.error(error);
        })
    }
    else {
        message.channel.send(`You must mention a user in order to allow them to request assessments once again. Example: !allow ${client.user!.toString()}`);
    }
}
