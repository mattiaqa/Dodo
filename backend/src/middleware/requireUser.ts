import { Request, Response, NextFunction } from "express";

const requireUser = (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if(!user) 
    {
        res.status(401).send({error: 'The user is not logged in'});
        return;
    }

    next();
    return;
}

export default requireUser;