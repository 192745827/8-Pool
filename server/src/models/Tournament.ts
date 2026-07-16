import mongoose, { Schema, Document } from 'mongoose';

export interface ITournamentMatch {
  matchId: string;
  round: 'semi-final' | 'final';
  player1: mongoose.Types.ObjectId;
  player2: mongoose.Types.ObjectId;
  winner?: mongoose.Types.ObjectId | null;
  roomId?: string | null;
  status: 'pending' | 'playing' | 'completed';
}

export interface ITournament extends Document {
  tournamentId: string;
  name: string;
  registeredPlayers: mongoose.Types.ObjectId[];
  status: 'registration' | 'semi-final' | 'final' | 'completed';
  matches: ITournamentMatch[];
  champion?: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const TournamentMatchSchema = new Schema({
  matchId: { type: String, required: true },
  round: { type: String, enum: ['semi-final', 'final'], required: true },
  player1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  player2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  winner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  roomId: { type: String, default: null },
  status: { type: String, enum: ['pending', 'playing', 'completed'], default: 'pending' },
});

const TournamentSchema: Schema = new Schema(
  {
    tournamentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    registeredPlayers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['registration', 'semi-final', 'final', 'completed'],
      default: 'registration',
    },
    matches: [TournamentMatchSchema],
    champion: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Tournament = mongoose.model<ITournament>('Tournament', TournamentSchema);
export default Tournament;
