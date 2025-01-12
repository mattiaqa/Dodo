import { Request, Response, NextFunction } from "express";
import { findUser } from '../service/user.service'

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if(!user) {
        //res.sendStatus(403);
        res.status(403).send('Not logged in');
        //res.status(403);
        //return res.send('Not Logged In')
        return;
    }

    const userData = await findUser({ _id: user.id });

    if(!userData?.isAdmin) {
        //res.sendStatus(403);
        res.status(403).send('Not an admin');
        return;
    }

    next();
}

export default requireAdmin;