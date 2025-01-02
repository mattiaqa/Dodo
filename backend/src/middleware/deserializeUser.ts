import {get} from 'lodash';
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from '../utils/jwt.utils';
import { reIssueAccessToken } from '../service/session.service';

const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = get(req, "headers.x-refresh");

    if(!accessToken) {
        next();
        return;
    }

    const {decoded, expired} = verifyJwt(accessToken);

    if(decoded) {
        res.locals.user = decoded;
        next();
        return;
    }

    if(expired && refreshToken) {
        const refreshTokenStr = Array.isArray(refreshToken) ? refreshToken[0] : refreshToken;
        const newAccessToken = await reIssueAccessToken({ refreshToken: refreshTokenStr });

        if(newAccessToken) {
            res.setHeader('x-access-token', newAccessToken);
        }

        const result = verifyJwt(newAccessToken as string);
        res.locals.user = result.decoded;
    }

    next();
    return;
}

export default deserializeUser;