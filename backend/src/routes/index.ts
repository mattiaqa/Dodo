import { Express, Request, Response } from "express";

import UserRoutes from './user';
import AuctionRoutes from './auction';
import ChatRoutes from './chat';

import { getBookInfoHandler } from "../controller/book.controller";
import requireUser from "../middleware/requireUser";

function routes(app: Express) {
    app.get('/health', (req: Request, res: Response) => {
        res.sendStatus(200);
    });

    app.use('/api/user', UserRoutes);
    app.use('/api/auction', AuctionRoutes);
    app.use('/api/chat', ChatRoutes);
    
    app.get('/api/book/info', [requireUser], getBookInfoHandler);
}

export default routes;