import { Request, Response, NextFunction } from "express";
import { findUser } from '../service/user.service'

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
     const user = res.locals.user;

    if(!user) {
        res.sendStatus(401);
        return;
    }

    const userData = await findUser({ _id: user._id });

    if(!userData?.isAdmin) {
        res.sendStatus(403);
        return;
    }

    next();
}

export default requireAdmin;