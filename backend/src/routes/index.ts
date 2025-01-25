import {Express, NextFunction, Request, Response} from "express";

import UserRoutes from './user';
import AuctionRoutes from './auction';
import ChatRoutes from './chat';
import BookRoutes from './book';

import DownloadRoutes from "./download/routes/download.routes";
import NotificationRoutes from "./notification/routes/notification.routes";

import csurf from 'csurf';

export const csrfProtection = csurf({ cookie: true })

function routes(app: Express) {
    app.get('/health', (req: Request, res: Response) => {
        res.sendStatus(200);
    });
    app.get('/api/csrf', csrfProtection, (req: Request, res: Response, next: NextFunction) => {
        res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: false, path: '/' });
        res.send();
    });

    app.use('/api/user', UserRoutes);
    app.use('/api/auction', AuctionRoutes);
    app.use('/api/chat', csrfProtection, ChatRoutes);
    app.use('/api/download', csrfProtection, DownloadRoutes);
    app.use('/api/notification', csrfProtection, NotificationRoutes);
    app.use('/api/book', BookRoutes);
}

export default routes;