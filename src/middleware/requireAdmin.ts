import { Request, Response, NextFunction } from "express";
import { findUser } from '../service/user.service'

const requireUser = async (req: Request, res: Response, next: NextFunction) => {
    var user = res.locals.user;

    if(!user) {
        res.sendStatus(403);
        return;
    }

    user = user._id

    const userData = await findUser({ _id: user });

    if(!userData?.isAdmin) {
        res.sendStatus(403);
        return;
    }

    next()
}

export default requireUser;