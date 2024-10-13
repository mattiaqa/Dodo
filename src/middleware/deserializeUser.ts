import {get} from 'lodash';
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from '../utils/jwt.utils';

const deserializeUser = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = get(req, "headers.authorization", "").replace(/^Bearer\s/, "")

    if(!accessToken) {
        next()
        return;
    }

    const {decoded, expired} = verifyJwt(accessToken);

    if(decoded) {
        res.locals.user = decoded;
    }

    next();
}

export default deserializeUser;