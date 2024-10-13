import { FilterQuery, UpdateQuery } from "mongoose";
import SessionModel, {SchemaDocument} from "../models/session.model";
import { Session } from "inspector/promises";

export async function createSession(userId: string, userAgent: string) {
    const session = await SessionModel.create({user: userId, userAgent});

    return session.toJSON();
}

export async function findSession(query: FilterQuery<SchemaDocument>) {
    return SessionModel.find(query).lean();
}

export async function updateSession(query: FilterQuery<SchemaDocument>, update: UpdateQuery<SchemaDocument>) {
    return SessionModel.updateOne(query, update);
}