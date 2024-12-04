import { Express, Request, Response } from "express";

import { createUserHandler, getUserAuctionsHandler, deleteUserHandler, uploadAvatarHandler, inviteUserHandler, acceptInviteHandler } from "./controller/user.controller";
import { createSessionHandler, getUserSessionHandler, deleteSessionHandler } from "./controller/session.controller";
import { createAuctionHandler, getAuctionHandler, getAllAuctionHandler, deleteAuctionHandler, searchAuctionHandler } from "./controller/auction.controller";
import { getBookInfoHandler } from "./controller/book.controller"
import { getBidsHandler, placeBidHandler } from "./controller/bid.controller";

import validateResource from './middleware/validateResource';
import requireUser from "./middleware/requireUser";
import requireAdmin from "./middleware/requireAdmin";

import { createUserSchema, getUserSchema } from "./schema/user.schema";
import { createSessionSchema } from "./schema/session.schema";
import { createAuctionSchema, getAuctionSchema, searchAuctionSchema } from "./schema/auction.schema";
import { placeBidSchema, getBidsSchema } from './schema/bid.schema';

import upload from "./utils/multer";
import {getChatSchema} from "./schema/chat.schema";
import {getChatHandler, getUserChatHandler, sendMessageHandler} from "./controller/chat.controller";
import {sendMessageSchema} from "./schema/message.schema";

function routes(app: Express) {
    app.get('/health', (req: Request, res: Response) => {
        res.sendStatus(200);
    });

    app.post('/api/register', validateResource(createUserSchema), createUserHandler);
    app.post('/api/login', validateResource(createSessionSchema), createSessionHandler);
    app.delete('/api/logout', requireUser, deleteSessionHandler);
    app.get('/api/session', requireUser, getUserSessionHandler);

    app.get('/api/user/auctions', requireUser, getUserAuctionsHandler);
    app.delete('/api/user', [requireAdmin, validateResource(getUserSchema)], deleteUserHandler);
    app.post('/api/user/avatar', requireUser, upload.single('avatar'), uploadAvatarHandler);

    app.post('/api/auction', [requireUser, validateResource(createAuctionSchema)], createAuctionHandler);
    app.get('/api/auction', validateResource(getAuctionSchema), getAuctionHandler);
    app.get('/api/auction/all', getAllAuctionHandler);
    app.delete('/api/auction', [requireAdmin, validateResource(getAuctionSchema)], deleteAuctionHandler);
    app.post('/api/auction/search', [validateResource(searchAuctionSchema)], searchAuctionHandler);

    app.post('/api/bid', [requireUser, validateResource(placeBidSchema)], placeBidHandler);
    app.get('/api/bid', [requireUser, validateResource(getBidsSchema)], getBidsHandler);


    app.post('/api/auction/search', [validateResource(searchAuctionSchema)], searchAuctionHandler);

    app.post('/api/user/invitation/invite', requireAdmin, inviteUserHandler);
    app.get('/api/user/invitation/accept/:token', requireUser, acceptInviteHandler);

    app.get('/api/book/info', [requireUser], getBookInfoHandler);

    app.get('/api/chat', [requireUser, validateResource(getChatSchema)], getChatHandler);
    app.post('/api/chat', [requireUser, validateResource(sendMessageSchema)], sendMessageHandler);
    app.get('/api/chat/all', [requireUser], getUserChatHandler);
}

export default routes;