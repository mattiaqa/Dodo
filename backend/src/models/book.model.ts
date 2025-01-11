import mongoose from "mongoose";

export interface BookInput {
    title: string;
    authors: string[];
    ISBN: string;
    publishedDate: string;
    language: string;

    publisher?: string;
    description?: string;
    subtitle?: string;
    imageLinks?: {smallThumbnail?: string, thumbnail?: string};   
}

export interface BookDocument extends BookInput, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        authors: [{ type: String, required: true }],
        ISBN: { type: String, required: true, unique: true },
        publishedDate: { type: String, requird: true},
        language: { type: String, required: true },
        
        publisher: { type: String },
        description: { type: String },
        subtitle: { type: String },
        imageLinks: {
            smallThumbnail: { type: String },
            thumbnail: { type: String },
        },
    },
    {
        timestamps: true,
        strict: true
    }
);

const BookModel = mongoose.model<BookDocument>("Book", bookSchema);

export default BookModel;