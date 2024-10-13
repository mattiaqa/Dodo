import { Request, Response } from "express";
import { validatePassword } from "../service/user.service";
import { createSession, findSession, updateSession } from "../service/session.service";
import { signJwt } from "../utils/jwt.utils";
import config from 'config'

export async function createSessionHandler(req: Request, res: Response): Promise<void> {
    const user = await validatePassword(req.body);

    if (!user) {
        res.status(401).send("Invalid email or password");
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

    res.send({ accessToken, refreshToken });
}

export async function getUserSessionHandler(req: Request, res: Response) {
    const userId = res.locals.user._id;

    const sessions = await findSession({user: userId, valid: true});

    res.send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response) {
    const sessionId = res.locals.user.session

    await updateSession({_id: sessionId}, {valid: false});

    res.send({
        accessToken: null,
        refreshToken: null
    })

}