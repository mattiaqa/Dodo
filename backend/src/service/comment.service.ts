import mongoose, { FilterQuery, QueryOptions } from "mongoose";
import CommentModel, { CommentInput, CommentDocument } from "../models/comment.model";
import sanitize from "mongo-sanitize";

export async function addComment(input: CommentInput) {
  try {
    const sanitizedInput = sanitize(input);
    const comment = await CommentModel.create(sanitizedInput);
 
    return comment.toJSON();
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getComments(query: FilterQuery<CommentDocument>, options: QueryOptions = {lean: true}) {
  try {
    const sanitizedQuery = sanitize(query);
    return await CommentModel.find(sanitizedQuery, {}, options).sort({ createdAt: -1 });
  } catch(e: any) {
    throw new Error(e);
  }
}

export async function deleteComment(commentId: string) {
  try {
    const commentIdObj = mongoose.isValidObjectId(commentId) ? new mongoose.Types.ObjectId(commentId) : null;
    return await CommentModel.deleteOne({_id: commentIdObj});
  } catch(e: any) {
    throw new Error(e);
  }
}