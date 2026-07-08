import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  host: mongoose.Types.ObjectId;
  guest?: mongoose.Types.ObjectId | null;
  status: 'lobby' | 'playing' | 'ended';
  isPrivate: boolean;
  maxPlayers: number;
  createdAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    roomId: {
      type: String,
      required: [true, 'Room ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host user reference is required'],
    },
    guest: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['lobby', 'playing', 'ended'],
      default: 'lobby',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    maxPlayers: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
export default Room;
