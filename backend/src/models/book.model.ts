import mongoose from "mongoose";

export interface BookInput {
    title: string;
    author: string[];
    publisher: string;
    publishedDate: string;
    language: string;
    ISBN: string;
    description: string;
}

export interface BookDocument extends BookInput, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        author: [{ type: String, required: true }],
        publisher: { type: String, required: true},
        language: { type: String, required: true },
        ISBN: { type: String, required: true, unique: true },
        description: { type: String, required: true, default: "" },
    },
    {
        timestamps: true,
    }
);

const BookModel = mongoose.model<BookDocument>("Book", bookSchema);

export default BookModel;