import mongoose from "mongoose";

export interface StatisticInput {
    successfullyClosed: number;
    unsuccessfullyClosed: number;
    auctionsRemoved: number;
    auctionsEdited: number;
}

export interface StatisticDocument extends StatisticInput, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const statisticSchema = new mongoose.Schema(
    {
        statisticId: {type: String, required: true, unique: true},
        successfullyClosed: {type: Number, default: 0},
        unsuccessfullyClosed: {type: Number, default: 0},
        auctionsRemoved: {type: Number, default: 0},
        auctionsEdited: {type: Number, default: 0},
    },
    {
        timestamps: true,
    }
);

const StatisticModel = mongoose.model<StatisticDocument>("Statistic", statisticSchema);

export default StatisticModel;