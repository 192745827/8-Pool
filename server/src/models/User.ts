import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value',
      },
      min: [0, 'Games played cannot be negative'],
    },
    gamesWon: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value',
      },
      min: [0, 'Games won cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
