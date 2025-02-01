import mongoose, { FilterQuery, UpdateQuery } from "mongoose";
import { omit, pick } from "lodash";
import UserModel, { UserDocument, UserInput } from "../models/user.model";
import AuctionModel, { AuctionDocument } from "../models/auction.model";
import config from 'config';
import { signJwt, verifyJwt } from "../utils/jwt.utils";
import { renderEmail, sendEmail } from "../utils/sendMail";


export async function createUser(input: UserInput) {
  try {
    const user = await UserModel.create(input);

    return omit(user.toJSON(), "password");
  } catch (e: any) {
    throw e;
  }
}

export async function validatePassword({email, password}: { email: string; password: string;}) {
  const user = await UserModel.findOne({ email });

  if (!user) {
    return null;
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) return null;

  return pick(user, ["_id", "email", "verified", "isAdmin", "name"]);
}

type SafeUser = Pick<UserDocument, "_id"|"email"|"isAdmin"|"verified"|"name"|"avatar"|"defaultAvatar"|"createdAt"|"updatedAt"|"savedAuctions"> & {id : UserDocument['_id']};
async function getUser(query: FilterQuery<UserDocument>): Promise<SafeUser | null> {
  const result = await UserModel.aggregate([
    { $match: query }, // Filtra per ID
    { 
      $project: { 
        id: "$_id", // Rinomina _id in id
        email: 1,
        isAdmin: 1,
        name: 1,
        avatar: 1,
        defaultAvatar:1,
        savedAuctions: 1,
        createdAt: 1,
        updatedAt: 1,
        verified: 1,

        _id: 0
      }
    }
  ]);

  return result[0] || null;
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const objectId = mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
  if (!objectId) {
    throw new Error("Invalid ID format");
  }

  return await getUser({ _id: objectId });
}
export async function getUserByEmail(email: string): Promise<SafeUser | null> {
  return await getUser({email});
}

export async function findUsers(query: FilterQuery<UserDocument>) {
  return UserModel.find(query).lean();
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

export async function confirmUser(token: string)
{
  try {
    // Decodifica del token JWT
    const payload = verifyJwt(token).decoded;

    if (!payload) {
      throw new Error('The token may be expired');
    }

    const {email} = payload as { email: string };
    if(!email) throw new Error('Invalid token');

    // Cerca l'utente nel database
    const user = await getUserByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.verified) {
      throw new Error('This user is already verified');
    }

    // Aggiorna lo stato dell'utente
    await updateUser({email}, {verified: true});

  } catch (err: any) {
    console.error("An error occured during the email verification: ", err);
    throw new Error(err);
  }
}

export async function createConfirmationLink(email: string)
{
  const port = config.get<number>('frontend_port');
  const hostname = config.get('hostname');
  const token = signJwt({email},{expiresIn: '3h'});

  const link = `http://${hostname}:4200/confirmUser/${token}`;
  return link;
}

export async function sendConfirmationEmail(address: string, link: string, name: string)
{
  const emailData = {
    name,
    link,
  };

  // Renderizza il template EJS
  const emailBody = await renderEmail('confirmation', emailData);
  await sendEmail(address, "Confirm Your Email Address - Welcome to DodoReads!", emailBody);
}