import * as Mongoose from 'mongoose';
import { resolve } from 'path';

export interface IGuildmate extends Mongoose.Document {
    discordId: string;
    assessments?: {
        heal?: boolean;
        tank?: boolean;
    };
}

const GuildmateSchema = new Mongoose.Schema({
    discordId: { type: String, required: true },
    assessments: {
        heal: { type: Boolean, required: false },
        tank: { type: Boolean, required: false }
    }
});

const Guildmate: Mongoose.Model<IGuildmate> = Mongoose.model(
    'Guildmate',
    GuildmateSchema
);

export function InitializeDatabase(connectionString: string) {
    Mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).catch(err => {
        if (err) console.error(err.message);
    });
}

export function GetGuildmate(discordId: string): Promise<IGuildmate | null> {
    return new Promise(async (resolve, reject) => {
        const guildie: IGuildmate | null = await Guildmate.findOne({
            discordId: discordId
        });
        if (guildie) {
            return resolve(guildie);
        } else {
            return reject(null);
        }
    });
}

export function CreateOrUpdateGuildmate(
    guildmate: IGuildmate
): Promise<IGuildmate | null> {
    return new Promise(async (resolve, reject) => {
        const disId = guildmate.discordId;
        const guildie = await Guildmate.findOneAndUpdate(
            { discordId: disId },
            { discordId: disId, assessments: guildmate.assessments! },
            { upsert: true, new: true }
        );
        if (guildie) {
            return resolve(guildie);
        }
        return reject(null);
    });
}

export function DeleteGuildmate(userId: string): Promise<DeleteCode> {
    return new Promise(async (resolve) => {
        try {
            const result = await Guildmate.findOne({
                discordId: userId
            });
            if (result) {
                await result.delete();
                return resolve(0);
            } else {
                return resolve(1);
            }
        } catch (err) {
            if (err) console.error(err.message);
            return resolve(2);
        }
    });
}

export enum DeleteCode {
    Success = 0,
    UserNotFound = 1,
    DatabaseFailure = 2
}
