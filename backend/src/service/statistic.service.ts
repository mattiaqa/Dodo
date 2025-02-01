import StatisticModel from "../models/statistic.model";
import AuctionModel from "../models/auction.model";

const SINGLETON_ID = "singleton";

export async function getAllStatistics() {
    try {
        return await StatisticModel.findOne({statisticId: SINGLETON_ID});
    } catch(e: any) {
        throw new Error(e);
    }
}

export async function addSuccessfullyClosed() {
    try {
        return await StatisticModel.updateOne(
            { statisticId: SINGLETON_ID },
            { $inc: { successfullyClosed: 1 } }
        );
    } catch(e: any) {
        throw new Error(e);
    }
}

export async function addUnsuccessfullyClosed() {
    try {
        return await StatisticModel.updateOne(
            { statisticId: SINGLETON_ID },
            { $inc: { unsuccessfullyClosed: 1 } }
        );
    } catch(e: any) {
        throw new Error(e);
    }
}

export async function addAuctionRemoved() {
    try {
        return await StatisticModel.updateOne(
            { statisticId: SINGLETON_ID },
            { $inc: { auctionsRemoved: 1 } }
        );
    } catch(e: any) {
        throw new Error(e);
    }
}

export async function addAuctionEdited() {
    try {
        return await StatisticModel.updateOne(
            { statisticId: SINGLETON_ID },
            { $inc: { auctionsEdited: 1 } }
        );
    } catch(e: any) {
        throw new Error(e);
    }
}

export async function getTotalAuctions() {
    try {
        return await AuctionModel.countDocuments({});
    } catch(e: any) {
        throw new Error(e);
    }
}