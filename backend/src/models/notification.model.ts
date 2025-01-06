import mongoose from "mongoose";
import {UserDocument} from "./user.model";
import {boolean} from "zod";

export interface NotificationInput {
    userId: UserDocument["_id"];
    title: string;
    text: string;
}

export interface NotificationDocument extends NotificationInput, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {type: String, required: true},
        text: {type: String, required: true},
        read: {type: Boolean, required: true, default: false},
    },
    {
        timestamps: true,
    }
);

const NotificationModel = mongoose.model<NotificationDocument>("Notification", NotificationSchema);

export default NotificationModel;