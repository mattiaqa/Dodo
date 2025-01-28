import { Request, Response } from "express";

import logger from "../utils/logger";
import {sendMessageSchema} from "../schema/message.schema";
import {newChat, searchChat, searchChatsByUser} from "../service/chat.service";
import {searchMessagesByChatId, sendMessage} from "../service/message.service";
import {getAuctionById} from "../service/auction.service";
import {omit} from "lodash";
import { z } from "zod";

export async function sendMessageHandler(req: Request<{},{}, z.infer<typeof sendMessageSchema>>, res: Response) {
    try{
        const sender = res.locals.user!.id;
        const { content, chatId } = req.body;

        const message = await sendMessage({sender, content, chatId});

        res.send(omit(message, "__v", "sender", "_id", "createdAt", "updatedAt"));
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

export async function getChatHandler(req: Request, res: Response) {
    try {
        const {auctionId} = req.params;
        const userId = res.locals.user!.id;

        const auction = await getAuctionById(auctionId);

        if (!auction) {
            res.status(404).send({"Error": "No auction found"});
            return;
        }

        let chat = await searchChat({
            auctionId,
            participants: userId
        });

        if (!chat) {
            chat = await newChat({
                participants: [userId, auction!.seller],
                auctionId
            });

        }
        const messages = await searchMessagesByChatId(chat!._id);

        res.send({
            chat,
            messages,
        });
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

export async function getUserChatHandler(req: Request, res: Response) {
    try {
        const userId = res.locals.user!.id;

        const chats = await searchChatsByUser({participants: userId});

        if(!chats) {
            res.status(404).send({"Error": "No chat found"});
        }

        const chatDetails = await Promise.all(
            chats!.map(async (chat) => {
                const auction = await getAuctionById(chat.auctionId);

                return {
                    chatId: chat._id,
                    auctionTitle: auction?.title,
                    auctionId: auction?.auctionId,
                    participants: chat.participants,
                    avatar: res.locals.user!.avatar
                };
            })
        );

        res.send(chatDetails);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}
