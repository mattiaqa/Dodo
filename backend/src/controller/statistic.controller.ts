import {Request, Response} from "express";
import logger from "../utils/logger";
import {getAllStatistics, getTotalAuctions} from "../service/statistic.service";

/**
 * Handler to get the total number of auctions in the system.
 *
 * Process:
 * - Calls a service function to get the total number of auctions.
 * - Returns the total number of auctions in the response.
 * - If an error occurs, returns a 500 internal server error.
 */
export async function totalAuctions(req: Request, res: Response) {
    try {
        const totalAuctions =  await getTotalAuctions();

        res.send({"total": totalAuctions});
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({"Error": "Internal Server Error"});
    }
}

/**
 * Handler to retrieve various statistics from the system.
 *
 * Process:
 * - Calls a service function to fetch all relevant statistics.
 * - Returns the statistics in the response.
 * - If an error occurs, returns a 500 internal server error.
 */
export async function allStatistics(req: Request, res: Response) {
    try {
        const statistics =  await getAllStatistics();

        res.send(statistics);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({"Error": "Internal Server Error"});
    }
}
