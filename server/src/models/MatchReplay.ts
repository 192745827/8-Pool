import mongoose, { Schema, Document } from 'mongoose';

export interface IShotRecord {
  shotNumber: number;
  shooterId: mongoose.Types.ObjectId;
  shooterRole: 'host' | 'guest';
  angle: number;
  power: number;
  timestamp: Date;
  ballsSnapshot: Array<{
    id: number;
    x: number;
    y: number;
    z: number;
    isActive: boolean;
  }>;
}

export interface IMatchReplay extends Document {
  roomId: string;
  host: mongoose.Types.ObjectId;
  guest?: mongoose.Types.ObjectId | null;
  winner: 'host' | 'guest';
  winnerUser?: mongoose.Types.ObjectId | null;
  shots: IShotRecord[];
  gameDuration: number;
  createdAt: Date;
}

const ShotRecordSchema: Schema = new Schema(
  {
    shotNumber: { type: Number, required: true },
    shooterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shooterRole: { type: String, enum: ['host', 'guest'], required: true },
    angle: { type: Number, required: true },
    power: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    ballsSnapshot: [
      {
        id: { type: Number, required: true },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        z: { type: Number, required: true },
        isActive: { type: Boolean, required: true },
      },
    ],
  },
  { _id: false }
);

const MatchReplaySchema: Schema = new Schema(
  {
    roomId: { type: String, required: true, index: true },
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    guest: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    winner: { type: String, enum: ['host', 'guest'], required: true },
    winnerUser: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    shots: [ShotRecordSchema],
    gameDuration: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const MatchReplay = mongoose.model<IMatchReplay>('MatchReplay', MatchReplaySchema);
export default MatchReplay;
