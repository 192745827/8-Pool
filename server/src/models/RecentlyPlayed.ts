import mongoose, { Schema, Document } from 'mongoose';

export interface IRecentlyPlayed extends Document {
  user: mongoose.Types.ObjectId;
  opponent: mongoose.Types.ObjectId;
  playedAt: Date;
}

const RecentlyPlayedSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    opponent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

RecentlyPlayedSchema.index({ user: 1, opponent: 1 });

export const RecentlyPlayed = mongoose.model<IRecentlyPlayed>('RecentlyPlayed', RecentlyPlayedSchema);
export default RecentlyPlayed;
