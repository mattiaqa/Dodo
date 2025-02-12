import mongoose, { FilterQuery, UpdateQuery } from "mongoose";
import SessionModel, {SessionDocument} from "../models/session.model";
import { signJwt } from "../utils/jwt.utils";
import { verifyJwt } from "../utils/jwt.utils";
import {get} from 'lodash';
import { getUserById } from "./user.service";
import config from 'config'

export async function createSession(userId: string, userAgent: string) {
    const session = await SessionModel.create({user: userId, userAgent});

    return session.toJSON();
}

export async function findSession(query: FilterQuery<SessionDocument>) {
    return SessionModel.find(query).lean();
}

export async function updateSession(query: FilterQuery<SessionDocument>, update: UpdateQuery<SessionDocument>) {
    return SessionModel.updateOne(query, update);
}

export async function reIssueAccessToken({refreshToken}:{refreshToken: string;}) {
    const {decoded} = verifyJwt(refreshToken);

    if(!decoded || !get(decoded, 'session')) 
        return false;

    const session = await SessionModel.findById(get(decoded,'session'));

    if(!session || !session.valid) 
        return false;

    const user = await getUserById( session.user as string );

    if(!user) 
        return false;

    const {_id, ...rest} = user;
    const accessToken = signJwt(
        { ...rest, id: _id, session: session._id },
        { expiresIn: config.get('refreshTokenTTL') },
    );
    
    return accessToken;
}