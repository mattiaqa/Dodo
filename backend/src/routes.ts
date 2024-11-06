import { Express, Request, Response } from "express";

import { createUserHandler, getUserAuctionsHandler, deleteUserHandler, uploadAvatarHandler } from "./controller/user.controller";
import { createSessionHandler, getUserSessionHandler, deleteSessionHandler } from "./controller/session.controller";
import { createAuctionHandler, getAuctionHandler, getAllAuctionHandler, deleteAuctionHandler } from "./controller/auction.controller";
import { getBidsHandler, placeBidHandler } from "./controller/bid.controller";

import validateResource from './middleware/validateResource';
import requireUser from "./middleware/requireUser";
import requireAdmin from "./middleware/requireAdmin";

import { createUserSchema, getUserSchema } from "./schema/user.schema";
import { createSessionSchema } from "./schema/session.schema";
import { createAuctionSchema, getAuctionSchema } from "./schema/auction.schema";
import { placeBidSchema, getBidsSchema } from './schema/bid.schema';

import upload from "./utils/multer";

function routes(app: Express) {
    app.get('/health', (req: Request, res: Response) => {
        res.sendStatus(200);
    });

    app.post('/api/user', validateResource(createUserSchema), createUserHandler);
    app.get('/api/user/auctions', requireUser, getUserAuctionsHandler);
    app.delete('/api/user', [requireAdmin, validateResource(getUserSchema)], deleteUserHandler);
    app.post('/api/user/avatar', requireUser, upload.single('avatar'), uploadAvatarHandler);

    app.post('/api/session', validateResource(createSessionSchema), createSessionHandler);
    app.get('/api/session', requireUser, getUserSessionHandler);
    app.delete('/api/session', requireUser, deleteSessionHandler);

    app.post('/api/auction', [requireUser, validateResource(createAuctionSchema)], createAuctionHandler);
    app.get('/api/auction', validateResource(getAuctionSchema), getAuctionHandler);
    app.get('/api/auction/all', getAllAuctionHandler);
    app.delete('/api/auction', [requireAdmin, validateResource(getAuctionSchema)], deleteAuctionHandler);

    app.post('/api/bid', [requireUser, validateResource(placeBidSchema)], placeBidHandler);
    app.get('/api/bid', [requireUser, validateResource(getBidsSchema)], getBidsHandler);
}

export default routes;