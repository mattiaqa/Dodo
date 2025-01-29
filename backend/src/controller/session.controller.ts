import { Request, Response } from "express";
import { validatePassword } from "../service/user.service";
import { createSession, findSession, updateSession } from "../service/session.service";
import { createUser, getUserById, deleteUser, createConfirmationLink, sendConfirmationEmail, confirmUser } from "../service/user.service";
import { CreateUserInput, GetUserInput } from "../schema/user.schema";
import { omit } from "lodash";
import logger from "../utils/logger";
import { signJwt } from "../utils/jwt.utils";
import config from 'config';
import { z } from "zod";
import { loginSchema } from "../schema/session.schema";
import {notifyUser} from "../service/notification.service";


export async function createUserHandler(req: Request<{}, {}, CreateUserInput>, res: Response) {
    try {
        const user = await createUser(req.body);
        const link = await createConfirmationLink(user.email);
        await sendConfirmationEmail(user.email, link, user.name);

        await notifyUser({
            userId: user._id,
            title: "🎉 Welcome to Dodo!",
            text: `Hello ${user.name}, welcome aboard! 🎉\n` +
                "We're thrilled to have you join Dodo! Start exploring and enjoy your journey with us."
        });

        res.status(200).send({message: 'User created successfully, open your email to confirm', email: user.email});
    } catch (e: any) {
        logger.error(e);

        if (e.code === 11000) {
        res.status(409).send({
            message: 'User already exists with this email. Please log in or check your email to activate the account',
        });
        return;
        }

        res.status(500).send({
        message: 'An unexpected error occurred during the registration process',
        });
        return;
    }
}

export async function confirmUserHandler(req: Request, res: Response)
{
  const { token } = req.params;

  try {
      await confirmUser(token);
      res.status(200).send({ message: 'User verified successfully' });
  } catch (error: any) {
      logger.error(error);
      res.status(500).send({message: "Internal Server Error"});
  }
}


export async function deleteUserHandler(req: Request<GetUserInput>, res: Response){
  const { userId } = req.params;

  const user = await getUserById(userId);

  if (!user) {
    res.status(404).send({"Error": "User not found"});
    return;
  } 

  const deletedUser = await deleteUser({ _id: userId });

  res.status(200).send({
    "Message": "User deleted successfully",
    "user": omit(deletedUser, 'password')
  });
}


export async function createSessionHandler(req: Request<{}, {}, z.infer<typeof loginSchema>>, res: Response): Promise<void> {
    try {
        const loginInfo = req.body;
        const user = await validatePassword(loginInfo);

        if (!user) {
            res.status(401).send({"Error" : "Invalid email or password"});
            return;
        }
        if(!user.verified)
        {
            res.status(403).send({"Error": 'Your account is not activated. Please check your email'});
            return;
        }

        const session = await createSession(String(user._id), req.get("user-agent") || "");

        const { _id, ...rest } = user;
        const accessToken = signJwt(
            { ...rest, id: _id, session: session._id },
            { expiresIn: config.get('accessTokenTTL') },
        );

        const refreshToken = signJwt(
            { ...rest, id: _id, session: session._id },
            { expiresIn: config.get('refreshTokenTTL') },
        );

        res.cookie('accessToken', accessToken, { httpOnly: true });

        res.send({"refreshToken": refreshToken, "_id": user._id});
    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

export async function deleteSessionHandler(req: Request, res: Response) {
    try {
        const sessionId = res.locals.user!.session;

        await updateSession({_id: sessionId}, {valid: false});

        res.clearCookie('accessToken');
        res.send({"Message" : "Logged out successfully"});
    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}