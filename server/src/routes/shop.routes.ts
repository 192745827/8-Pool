import { Router, Response } from 'express';
import { protect } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth';
import { ShopItem } from '../models/ShopItem';
import { Inventory } from '../models/Inventory';
import { User } from '../models/User';

const router = Router();

// Default catalog seed dataset
const DEFAULT_CATALOG = [
  // Cues
  { itemId: 'cue_standard', name: 'Standard Wood Cue', category: 'cues', price: 0, icon: '🎱', previewColor: '#ca8a04', description: 'Classic hardwood pool cue stick.', isDefault: true },
  { itemId: 'cue_neon_cyber', name: 'Cyberpunk Neon Stick', category: 'cues', price: 500, icon: '⚡', previewColor: '#00f0ff', description: 'Illuminated cyan laser cue stick.' },
  { itemId: 'cue_dragon_blaze', name: 'Dragon Blaze Cue', category: 'cues', price: 1200, icon: '🔥', previewColor: '#f97316', description: 'Fiery dragon scale custom cue stick.' },
  { itemId: 'cue_royal_gold', name: 'Royal Gold Cue', category: 'cues', price: 2500, icon: '👑', previewColor: '#eab308', description: '24K gold plated championship cue stick.' },
  { itemId: 'cue_void_phantom', name: 'Void Phantom Cue', category: 'cues', price: 5000, icon: '🌌', previewColor: '#a855f7', description: 'Dark matter cosmic phantom cue stick.' },

  // Tables
  { itemId: 'table_classic_green', name: 'Classic Green Felt', category: 'tables', price: 0, icon: '🟩', previewColor: '#16a34a', description: 'Traditional green felt pool table.', isDefault: true },
  { itemId: 'table_cyber_blue', name: 'Cyber Neon Blue Felt', category: 'tables', price: 600, icon: '🟦', previewColor: '#0284c7', description: 'High-contrast neon electric blue felt.' },
  { itemId: 'table_purple_velvet', name: 'Royal Purple Velvet', category: 'tables', price: 1500, icon: '🟪', previewColor: '#9333ea', description: 'Luxury royal purple velvet cloth.' },
  { itemId: 'table_crimson_red', name: 'Crimson Passion Red', category: 'tables', price: 3000, icon: '🟥', previewColor: '#dc2626', description: 'Vibrant championship crimson felt.' },

  // Avatars
  { itemId: 'avatar_1', name: 'Classic Maverick', category: 'avatars', price: 0, icon: '👤', previewColor: '#38bdf8', description: 'Standard pool avatar.', isDefault: true },
  { itemId: 'avatar_cyberpunk', name: 'Cyberpunk Runner', category: 'avatars', price: 400, icon: '🤖', previewColor: '#a855f7', description: 'Neon augmented pool competitor.' },
  { itemId: 'avatar_pool_shark', name: 'Pool Shark Pro', category: 'avatars', price: 1000, icon: '🦈', previewColor: '#0284c7', description: 'Relentless pool table shark avatar.' },
  { itemId: 'avatar_royal_crown', name: 'Royal Crown King', category: 'avatars', price: 2000, icon: '👑', previewColor: '#eab308', description: 'Regal crown master profile avatar.' },

  // Emotes
  { itemId: 'emote_cool', name: '😎 Cool Shades', category: 'emotes', price: 0, icon: '😎', previewColor: '#38bdf8', description: 'Smooth cool reaction emote.', isDefault: true },
  { itemId: 'emote_rocket', name: '🚀 Rocket Blast', category: 'emotes', price: 250, icon: '🚀', previewColor: '#f97316', description: 'High velocity shot reaction emote.' },
  { itemId: 'emote_boom', name: '💥 Boom Impact', category: 'emotes', price: 300, icon: '💥', previewColor: '#eab308', description: 'Powerful break shot explosion emote.' },
  { itemId: 'emote_fire', name: '🔥 On Fire', category: 'emotes', price: 500, icon: '🔥', previewColor: '#ef4444', description: 'Winning streak flame reaction emote.' },

  // Victory Effects
  { itemId: 'effect_fireworks', name: 'Confetti Fireworks', category: 'victory_effects', price: 0, icon: '🎆', previewColor: '#eab308', description: 'Celebratory confetti fireworks on match win.', isDefault: true },
  { itemId: 'effect_neon_pulse', name: 'Neon Laser Pulse', category: 'victory_effects', price: 800, icon: '💫', previewColor: '#00f0ff', description: 'Electric neon wave pulse victory effect.' },
  { itemId: 'effect_flame_streamer', name: 'Flame Streamer', category: 'victory_effects', price: 1800, icon: '🌋', previewColor: '#ef4444', description: 'Erupting volcano flame victory effect.' },
];

/**
 * Ensures shop catalog database is seeded with default items
 */
const ensureCatalogSeeded = async () => {
  const count = await ShopItem.countDocuments();
  if (count === 0) {
    await ShopItem.insertMany(DEFAULT_CATALOG);
  }
};

router.use(protect);

/**
 * GET /api/shop/items
 * Get all available catalog shop items
 */
router.get('/items', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await ensureCatalogSeeded();
    const items = await ShopItem.find({}).sort({ category: 1, price: 1 });
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch shop items' });
  }
});

/**
 * GET /api/shop/inventory
 * Get user's inventory, owned item IDs, and active equipped slots
 */
router.get('/inventory', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let inventory = await Inventory.findOne({ user: userId });
    if (!inventory) {
      inventory = new Inventory({ user: userId });
      await inventory.save();
    }

    const user = await User.findById(userId);

    res.json({
      inventory,
      coins: user?.coins || 0,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch inventory' });
  }
});

/**
 * POST /api/shop/buy
 * Purchase a shop item with coins
 */
router.post('/buy', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.body;

    if (!userId || !itemId) {
      res.status(400).json({ message: 'Item ID is required' });
      return;
    }

    const shopItem = await ShopItem.findOne({ itemId });
    if (!shopItem) {
      res.status(404).json({ message: 'Shop item not found' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let inventory = await Inventory.findOne({ user: userId });
    if (!inventory) {
      inventory = new Inventory({ user: userId });
    }

    // Check if already owned
    if (inventory.ownedItemIds.includes(itemId)) {
      res.status(400).json({ message: 'Item is already owned' });
      return;
    }

    // Check coin balance
    if (user.coins < shopItem.price) {
      res.status(400).json({ message: 'Insufficient coins' });
      return;
    }

    // Deduct coins & add item to inventory
    user.coins -= shopItem.price;
    await user.save();

    inventory.ownedItemIds.push(itemId);
    await inventory.save();

    res.json({
      message: 'Item purchased successfully',
      coins: user.coins,
      inventory,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to purchase item' });
  }
});

/**
 * POST /api/shop/equip
 * Equip an owned item
 */
router.post('/equip', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { category, itemId } = req.body;

    if (!userId || !category || !itemId) {
      res.status(400).json({ message: 'Category and Item ID are required' });
      return;
    }

    let inventory = await Inventory.findOne({ user: userId });
    if (!inventory) {
      inventory = new Inventory({ user: userId });
    }

    // Check ownership
    if (!inventory.ownedItemIds.includes(itemId)) {
      res.status(400).json({ message: 'You do not own this item' });
      return;
    }

    // Update equipped slot
    if (category === 'cues') inventory.equipped.cue = itemId;
    else if (category === 'tables') inventory.equipped.table = itemId;
    else if (category === 'avatars') {
      inventory.equipped.avatar = itemId;
      // Also sync user avatar in user document
      await User.findByIdAndUpdate(userId, { avatar: itemId });
    } else if (category === 'victory_effects') inventory.equipped.victoryEffect = itemId;

    await inventory.save();

    res.json({
      message: 'Item equipped successfully',
      inventory,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to equip item' });
  }
});

export default router;
