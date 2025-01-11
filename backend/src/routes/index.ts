import { Express, Request, Response } from "express";

import UserRoutes from './user';
import AuctionRoutes from './auction';
import ChatRoutes from './chat';
import BookRoutes from './book';

import { getBookInfoHandler } from "../controller/book.controller";
import requireUser from "../middleware/requireUser";
import DownloadRoutes from "./download/routes/download.routes";
import NotificationRoutes from "./notification/routes/notification.routes";

function routes(app: Express) {
    app.get('/health', (req: Request, res: Response) => {
        res.sendStatus(200);
    });

    app.use('/api/user', UserRoutes);
    app.use('/api/auction', AuctionRoutes);
    app.use('/api/chat', ChatRoutes);
    app.use('/api/download', DownloadRoutes);
    app.use('/api/notification', NotificationRoutes);
    app.use('/api/book', BookRoutes);
}

export default routes;