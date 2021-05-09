import * as Discord from 'discord.js';
import { GlobalStore } from '../store/index';

export function watchReactions(
    message: Discord.Message,
    client: Discord.Client,
    callback: Function
): void {
    const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
        return (
            ['tank', 'healer'].includes(reaction.emoji.name) &&
            user !== client.user
        );
    };
    const reactionCollector = message.createReactionCollector(filter);
    reactionCollector.on('collect', (reaction, user) => {
        reaction.users.remove(user);
        if (reaction.emoji.name === 'tank' && GlobalStore.tankAssessmentUsers.indexOf(user.tag) === -1) {
            GlobalStore.tankAssessmentUsers.push(user.tag);
            setTimeout(() => {
                GlobalStore.tankAssessmentUsers = GlobalStore.tankAssessmentUsers.filter((element) => {
                    return element !== user.tag;
                });
            }, 1000*60*60);
            callback(reaction, user);
        }
        if (reaction.emoji.name === 'healer' && GlobalStore.healerAssessmentUsers.indexOf(user.tag) === -1) {
            GlobalStore.healerAssessmentUsers.push(user.tag);
            setTimeout(() => {
                GlobalStore.healerAssessmentUsers = GlobalStore.healerAssessmentUsers.filter((element) => {
                    return element !== user.tag;
                });
            }, 1000*60*60);
            callback(reaction, user);
        }
    });
}
