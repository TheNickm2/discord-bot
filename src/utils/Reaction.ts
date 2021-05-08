import * as Discord from 'discord.js';

export function watchReactions(
    message: Discord.Message,
    client: Discord.Client,
    callback: Function
): void {
    const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
        return ['tank', 'healer'].includes(reaction.emoji.name) && user !== client.user;
    };
    const reactionCollector = message.createReactionCollector(filter);
    reactionCollector.on('collect', (reaction, user) => {
        reaction.users.remove(user);
        callback(reaction, user);
    });
}
