import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyReward extends Document {
  user: mongoose.Types.ObjectId;
  streak: number;
  lastClaimDate: Date | null;
  claimedDays: number[];
}

const DailyRewardSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    streak: { type: Number, default: 0, min: 0, max: 7 },
    lastClaimDate: { type: Date, default: null },
    claimedDays: { type: [Number], default: [] },
  },
  {
    timestamps: true,
  }
);

export const DailyReward = mongoose.model<IDailyReward>('DailyReward', DailyRewardSchema);
export default DailyReward;
