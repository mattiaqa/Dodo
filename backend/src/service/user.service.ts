import { FilterQuery, UpdateQuery } from "mongoose";
import { omit } from "lodash";
import UserModel, { UserDocument, UserInput } from "../models/user.model";
import AuctionModel, { AuctionDocument } from "../models/auction.model";

export async function createUser(input: UserInput) {
  try {
    const user = await UserModel.create(input);

    return omit(user.toJSON(), "password");
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function validatePassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await UserModel.findOne({ email });

  if (!user) {
    return null;
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) return null;

  return omit(user.toJSON(), "password");
}

export async function findUser(query: FilterQuery<UserDocument>) {
  return UserModel.findOne(query).lean();
}

export async function getUserAuctions(query: FilterQuery<AuctionDocument>) {
  return AuctionModel.find(query).lean();
}

export async function deleteUser(query: FilterQuery<UserDocument>) {
  try {
    return await UserModel.deleteOne(query);
  } catch(e: any) {
    throw new Error(e);
  }
}

export async function updateUser(query: FilterQuery<UserDocument>, update: UpdateQuery<UserDocument>) {
  return UserModel.findOneAndUpdate(query, update, { new: true });
}