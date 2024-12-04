import {UserDocument} from "./user.model";
import mongoose from "mongoose";
import {ChatDocument} from "./chat.model";

export interface MessageInput {
    sender: UserDocument['_id'];
    content: string;
    chatId: ChatDocument['_id'];
}

export interface MessageDocument extends MessageInput, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: {type: String, required: true},
        chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    },
    {
        timestamps: true,
    }
);

const MessageModel = mongoose.model<ChatDocument>("Message", messageSchema);
export default MessageModel;