import { Request, Response, NextFunction } from "express";
import { getUserById } from '../service/user.service'

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if(!user) {
        res.status(403).send('Not logged in');
        return;
    }

    const userData = await getUserById( user.id );

    if(!userData?.isAdmin) {
        res.status(403).send('Not an admin');
        return;
    }

    next();
}

export default requireAdmin;