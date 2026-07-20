import mongoose, { Schema, Document } from 'mongoose';

export interface IEquippedItems {
  cue: string;
  table: string;
  avatar: string;
  victoryEffect: string;
}

export interface IInventory extends Document {
  user: mongoose.Types.ObjectId;
  ownedItemIds: string[];
  equipped: IEquippedItems;
}

const InventorySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    ownedItemIds: { type: [String], default: ['cue_standard', 'table_classic_green', 'avatar_1', 'emote_cool', 'effect_fireworks'] },
    equipped: {
      cue: { type: String, default: 'cue_standard' },
      table: { type: String, default: 'table_classic_green' },
      avatar: { type: String, default: 'avatar_1' },
      victoryEffect: { type: String, default: 'effect_fireworks' },
    },
  },
  {
    timestamps: true,
  }
);

export const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);
export default Inventory;
