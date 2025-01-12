import {get} from 'lodash';
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from '../utils/jwt.utils';
import { reIssueAccessToken } from '../service/session.service';
import { CurrentUserType } from '../../config/express';

const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = get(req, "headers.x-refresh");

    if(!accessToken) {
        next();
        return;
    }

    const { decoded, expired } = verifyJwt<CurrentUserType>(accessToken);

    if(decoded) {
        res.locals.user = decoded;
        next();
        return;
    }

    if(expired && refreshToken) {
        const refreshTokenStr = Array.isArray(refreshToken) ? refreshToken[0] : refreshToken;
        const newAccessToken = await reIssueAccessToken({ refreshToken: refreshTokenStr });

        if(newAccessToken) {
            res.cookie('accessToken', newAccessToken);
        }

        const { decoded } = verifyJwt<CurrentUserType>(newAccessToken as string);
        if(decoded)
            res.locals.user = decoded;
    }

    next();
    return;
}

export default deserializeUser;