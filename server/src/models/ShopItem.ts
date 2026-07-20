import mongoose, { Schema, Document } from 'mongoose';

export type ItemCategory = 'cues' | 'tables' | 'avatars' | 'emotes' | 'victory_effects';

export interface IShopItem extends Document {
  itemId: string;
  name: string;
  category: ItemCategory;
  price: number;
  icon: string;
  previewColor?: string;
  description: string;
  isDefault?: boolean;
}

const ShopItemSchema: Schema = new Schema(
  {
    itemId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['cues', 'tables', 'avatars', 'emotes', 'victory_effects'],
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    icon: { type: String, required: true },
    previewColor: { type: String, default: '#00f0ff' },
    description: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const ShopItem = mongoose.model<IShopItem>('ShopItem', ShopItemSchema);
export default ShopItem;
