import { Request, Response } from "express";
import { validatePassword } from "../service/user.service";
import { createSession, findSession, updateSession } from "../service/session.service";
import { createUser, findUser, deleteUser, createConfirmationLink, sendConfirmationEmail, confirmUser } from "../service/user.service";
import { CreateUserInput, GetUserInput } from "../schema/user.schema";
import { omit } from "lodash";
import logger from "../utils/logger";
import { signJwt } from "../utils/jwt.utils";
import config from 'config';



export async function createUserHandler(
    req: Request<{}, {}, CreateUserInput["body"]>,
    res: Response
    ) {
    try {
        const user = await createUser(req.body);
        const link = await createConfirmationLink(user.email);
        await sendConfirmationEmail(user.email, link, user.name);

        res.status(200).send({message: 'User created successfully, open your email to confirm', email: user.email});
    } catch (e: any) {
        logger.error(e);

        // Controllo se l'errore è dovuto a una chiave duplicata
        if (e.code === 11000) {
        res.status(409).send({
            message: 'User already exists with this email. Please log in or check your email to activate the account',
        });
        return;
        }

        // Altri tipi di errori
        res.status(500).send({
        message: 'An unexpected error occurred during the registration process',
        error: e.message,
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
      res.status(400).send(error.message);
  }
}


export async function deleteUserHandler(req: Request<GetUserInput['body']>, res: Response){
  const userId = res.locals.user._id;

  const user = await findUser({ _id: userId });

  if (!user) {
    res.sendStatus(404);
    return;
  } 

  const deletedUser = await deleteUser({ _id: userId });

  res.send(omit(deletedUser, 'password'));
}


export async function createSessionHandler(req: Request, res: Response): Promise<void> {
    const user = await validatePassword(req.body);

    if (!user) {
        res.status(401).send("Invalid email or password");
        return;
    }
    if(!user.verified)
    {
        res.status(403).send({error: 'Your account is not activated. Please check your email'});
        return;
    }

    const session = await createSession(String(user._id), req.get("user-agent") || "");

    const accessToken = signJwt(
        { ...user, session: session._id },
        { expiresIn: config.get('accessTokenTTL') },
    );

    const refreshToken = signJwt(
        { ...user, session: session._id },
        { expiresIn: config.get('refreshTokenTTL') },
    );

    res.cookie('accessToken', accessToken, { httpOnly: true });

    res.send({ accessToken, refreshToken });
}

export async function getUserSessionHandler(req: Request, res: Response) {
    const userId = res.locals.user._id;

    const sessions = await findSession({user: userId, valid: true});

    res.send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response) {
    const sessionId = res.locals.user.session;

    await updateSession({_id: sessionId}, {valid: false});

    res.send({
        accessToken: null,
        refreshToken: null
    });
}