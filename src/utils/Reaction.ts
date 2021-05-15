import * as Discord from 'discord.js';
import * as Database from '../database/db';

export function watchReactions(
    message: Discord.Message,
    client: Discord.Client,
    guild: Discord.Guild,
    callback: Function
): void {
    const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
        return (
            ['tank', 'healer'].includes(reaction.emoji.name) &&
            user !== client.user
        );
    };
    const reactionCollector = message.createReactionCollector(filter);

    reactionCollector.on('collect', async (reaction, user) => {
        // fetch the healer and tank roles, see if the user is a part of the roles and prevent their request if so
        const tankRole = await guild.roles.fetch('840388506093355018');
        const healRole = await guild.roles.fetch('840388499937165325');
        if (reaction.emoji.name === 'tank' && tankRole) {
            const findMember = await tankRole.members.find(
                (member: Discord.GuildMember) => member.id === user.id
            );
            if (findMember) {
                // User has tank role, ignore
                return;
            }
        }
        if (reaction.emoji.name === 'healer' && healRole) {
            const findMember = await healRole.members.find(
                (member: Discord.GuildMember) => member.id === user.id
            );
            if (findMember) {
                // User has healer role, ignore
                return;
            }
        }

        // User does not have the tank or healer role that they've requested an eval for. Check database to see if user has already requested this eval type.
        let assessmentUser: any = {};
        try {
            assessmentUser = await Database.GetGuildmate(user.id);
            if (assessmentUser && assessmentUser.assessments) {
                if (
                    reaction.emoji.name === 'tank' &&
                    assessmentUser.assessments.tank
                ) {
                    // User already requested tank assessment, ignore.
                    return;
                } else if (
                    reaction.emoji.name === 'healer' &&
                    assessmentUser.assessments.heal
                ) {
                    // User already requested healer assessment, ignore.
                    return;
                }
            }
        } catch (error) {
            if (error) {
                console.error(error);
            }
        }
        
        // At this point, the user does not have the tank/healer role nor has their request been found in the database.
        const userData: any = {
            discordId: user.id,
            assessments: {}
        };
        if (assessmentUser && assessmentUser.assessments) {
            userData.assessments = assessmentUser.assessments;
        }
        if (reaction.emoji.name === 'tank') userData.assessments.tank = true;
        else if (reaction.emoji.name === 'healer') userData.assessments.heal = true;
        const success = Database.CreateOrUpdateGuildmate(userData);
        if (success) {
            callback(reaction, user);
        }
        else {
            const nick = await client.users.fetch('');
            if (nick) {
                nick.send('An error occurred in Reaction.ts on line 73 - database creation/update unsuccessful.');
            }
        }
    });
}
