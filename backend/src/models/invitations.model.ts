import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
    email: string;
    token: string;
    expiresAt: Date;
    used: boolean;
}

const InvitationSchema: Schema = new Schema({
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
});

export default mongoose.model<IInvitation>('Invitation', InvitationSchema);
