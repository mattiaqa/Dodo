import { Request, Response } from "express";
import { validatePassword } from "../service/user.service";
import { createSession, updateSession } from "../service/session.service";
import { createUser, getUserById, deleteUser, createConfirmationLink, sendConfirmationEmail, confirmUser } from "../service/user.service";
import { CreateUserInput, GetUserInput } from "../schema/user.schema";
import { omit } from "lodash";
import logger from "../utils/logger";
import { signJwt } from "../utils/jwt.utils";
import config from 'config';
import { z } from "zod";
import { loginSchema } from "../schema/session.schema";
import {notifyUser} from "../service/notification.service";

/**
 * Handler to create a new user and send a confirmation email.
 *
 * Process:
 * - Validates the user input and creates a new user in the database.
 * - Generates a confirmation link for the user and sends a confirmation email with the link.
 * - Sends a welcome notification to the user.
 * - Returns a success message indicating the user has been created and a confirmation email is sent.
 * - If the user already exists, returns a 409 conflict error with a message.
 * - If an unexpected error occurs, returns a 500 internal server error.
 */
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

/**
 * Handler to confirm a user's email after they click on the confirmation link.
 *
 * Process:
 * - Retrieves the confirmation token from the URL parameters.
 * - Verifies the token and confirms the user’s registration.
 * - If successful, returns a success message indicating that the user has been verified.
 * - If an error occurs during confirmation, returns a 500 error with the error message.
 */
export async function confirmUserHandler(req: Request, res: Response) {
    const { token } = req.params;

    try {
        await confirmUser(token);
        res.status(200).send({ message: 'User verified successfully' });
    } catch (error: any) {
        logger.error(error);
        res.status(500).send({message: error.message});
    }
}

/**
 * Handler to delete a user from the system.
 *
 * Process:
 * - Retrieves the user ID from the request parameters.
 * - Checks if the user exists in the system.
 * - If the user exists, deletes the user from the database.
 * - Returns a success message upon successful deletion.
 * - If the user does not exist, returns a 404 error with the message "User not found".
 */
export async function deleteUserHandler(req: Request<GetUserInput>, res: Response) {
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

/**
 * Handler to create a user session and authenticate the user.
 *
 * Process:
 * - Retrieves login information (email and password) from the request body.
 * - Validates the user's password and checks if the account is activated.
 * - Creates a new session for the user.
 * - Generates access and refresh tokens and sends the access token as an HTTP-only cookie.
 * - Returns the refresh token and user ID in the response.
 * - If login credentials are invalid or the account is not activated, returns appropriate error messages.
 * - If an error occurs during session creation, returns a 500 internal server error.
 */
export async function createSessionHandler(req: Request<{}, {}, z.infer<typeof loginSchema>>, res: Response): Promise<void> {
    try {
        const loginInfo = req.body;
        const user = await validatePassword(loginInfo);

        if (!user) {
            res.status(404).json({message : "Invalid email or password"});
            return;
        }
        if (!user.verified) {
            res.status(403).json({message: 'Your account is not activated. Please check your email'});
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

        res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'lax' });

        res.send({"refreshToken": refreshToken, "_id": user._id});
    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

/**
 * Handler to delete a user session and log the user out.
 *
 * Process:
 * - Retrieves the current session ID from the authenticated user (via res.locals.user).
 * - Invalidates the session in the database.
 * - Clears the access token cookie to log the user out.
 * - Returns a success message indicating the user has been logged out.
 * - If an error occurs during session deletion, returns a 500 internal server error.
 */
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