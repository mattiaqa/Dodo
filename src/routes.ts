import { Express, Request, Response } from "express";

import { createUserHandler } from "./controller/user.controller";
import { createSessionHandler, getUserSessionHandler, deleteSessionHandler } from "./controller/session.controller";
import { createAuctionHandler } from "./controller/auction.controller";

import validateResource from './middleware/validateResource';
import requireUser from "./middleware/requireUser";

import { createUserSchema } from "./schema/user.schema";
import { createSessionSchema } from "./schema/session.schema";
import { createAuctionSchema } from "./schema/auction.schema";

function routes(app: Express) {
    app.get('/health', (req: Request, res: Response) => {
        res.sendStatus(200);
    });

    app.post('/api/users', validateResource(createUserSchema), createUserHandler);

    app.post('/api/session', validateResource(createSessionSchema), createSessionHandler);
    app.get('/api/session', requireUser, getUserSessionHandler);
    app.delete('/api/session', requireUser, deleteSessionHandler);

    app.post('/api/auction', [requireUser, validateResource(createAuctionSchema)], createAuctionHandler);
}

export default routes;