import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { api } from '../services/api';

export type CategoryKey = 'cues' | 'tables' | 'avatars' | 'emotes' | 'victory_effects';

export interface ShopItemData {
  _id: string;
  itemId: string;
  name: string;
  category: CategoryKey;
  price: number;
  icon: string;
  previewColor?: string;
  description: string;
  isDefault?: boolean;
}

export interface InventoryData {
  ownedItemIds: string[];
  equipped: {
    cue: string;
    table: string;
    avatar: string;
    victoryEffect: string;
  };
}

export const Shop: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'store' | 'inventory'>('store');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('cues');
  
  const [items, setItems] = useState<ShopItemData[]>([]);
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }

    loadShopData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadShopData = async () => {
    setLoading(true);
    try {
      const [itemsRes, invRes] = await Promise.all([
        api.get('/api/shop/items'),
        api.get('/api/shop/inventory'),
      ]);

      setItems(itemsRes.data);
      setInventory(invRes.data.inventory);
      setUserCoins(invRes.data.coins);
    } catch (err: any) {
      console.error('Failed to load shop data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyItem = async (item: ShopItemData) => {
    setActionLoadingId(item.itemId);
    try {
      const res = await api.post('/api/shop/buy', { itemId: item.itemId });
      setUserCoins(res.data.coins);
      setInventory(res.data.inventory);
      showToast(`🎉 Successfully purchased ${item.name}!`);
    } catch (err: any) {
      showToast(`⚠️ ${err.response?.data?.message || 'Purchase failed'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEquipItem = async (item: ShopItemData) => {
    setActionLoadingId(item.itemId);
    try {
      const res = await api.post('/api/shop/equip', {
        category: item.category,
        itemId: item.itemId,
      });
      setInventory(res.data.inventory);
      showToast(`✨ Equipped ${item.name}!`);
    } catch (err: any) {
      showToast(`⚠️ ${err.response?.data?.message || 'Equip failed'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const categories: Array<{ key: CategoryKey; label: string; icon: string }> = [
    { key: 'cues', label: 'Cue Sticks', icon: '🎱' },
    { key: 'tables', label: 'Table Felts', icon: '🟩' },
    { key: 'avatars', label: 'Avatars', icon: '👤' },
    { key: 'emotes', label: 'Emotes', icon: '😎' },
    { key: 'victory_effects', label: 'Victory Effects', icon: '🎆' },
  ];

  const filteredItems = items.filter((item) => {
    if (item.category !== selectedCategory) return false;
    if (activeTab === 'inventory' && inventory) {
      return inventory.ownedItemIds.includes(item.itemId);
    }
    return true;
  });

  const getEquippedIdForCategory = (cat: CategoryKey): string => {
    if (!inventory) return '';
    if (cat === 'cues') return inventory.equipped.cue;
    if (cat === 'tables') return inventory.equipped.table;
    if (cat === 'avatars') return inventory.equipped.avatar;
    if (cat === 'victory_effects') return inventory.equipped.victoryEffect;
    return '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-black pb-12">
      {/* Background Neon Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div ref={containerRef} className="relative z-10 max-w-6xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-400 to-cyan-400">
              💰 Shop & Inventory Store
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Customize your cue sticks, table felt colors, avatars, emotes, and victory celebration effects.
            </p>
          </div>

          {/* Coins Balance Pill */}
          <div className="p-4 bg-slate-900/90 border border-amber-500/30 rounded-2xl backdrop-blur-xl flex items-center gap-3 shadow-lg shadow-amber-500/10">
            <span className="text-2xl">🪙</span>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Coins Balance</span>
              <span className="text-xl font-black text-amber-400 font-display">
                {userCoins.toLocaleString()} Coins
              </span>
            </div>
          </div>
        </div>

        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="mb-6 p-3 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold text-center animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* Store vs Inventory Main Tabs */}
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-6 py-2.5 text-xs font-extrabold rounded-2xl transition-all ${
              activeTab === 'store'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🛍️ Store Catalog
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2.5 text-xs font-extrabold rounded-2xl transition-all ${
              activeTab === 'inventory'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🎒 My Inventory ({inventory?.ownedItemIds.length || 0})
          </button>
        </div>

        {/* Category Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                selectedCategory === cat.key
                  ? 'bg-slate-800 border-cyan-400 text-cyan-300 shadow-md'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span className="mr-1.5">{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Item Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="inline-block w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Loading store items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
            <span className="text-5xl block mb-3">🛍️</span>
            <h3 className="text-lg font-bold text-white">No Items Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'inventory' ? 'You do not own any items in this category yet.' : 'No items available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isOwned = inventory?.ownedItemIds.includes(item.itemId);
              const isEquipped = getEquippedIdForCategory(item.category) === item.itemId;
              const canAfford = userCoins >= item.price;
              const isLoadingThis = actionLoadingId === item.itemId;

              return (
                <div
                  key={item.itemId}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden backdrop-blur-xl ${
                    isEquipped
                      ? 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : isOwned
                      ? 'bg-slate-900/80 border-slate-700'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {isEquipped && (
                    <div className="absolute top-4 right-4 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-cyan-400 text-black rounded-full shadow-md">
                      EQUIPPED ✔
                    </div>
                  )}

                  <div>
                    {/* Item Icon Preview */}
                    <div
                      className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4 border border-white/10 shadow-inner"
                      style={{ backgroundColor: `${item.previewColor || '#00f0ff'}20` }}
                    >
                      <span>{item.icon}</span>
                    </div>

                    <div className="text-center mb-4">
                      <h3 className="text-base font-extrabold text-white">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 border-t border-slate-800/80">
                    {isEquipped ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-cyan-500/20 text-cyan-300 font-extrabold text-xs rounded-xl border border-cyan-500/40 text-center cursor-default"
                      >
                        Active Equipped
                      </button>
                    ) : isOwned ? (
                      <button
                        onClick={() => handleEquipItem(item)}
                        disabled={isLoadingThis}
                        className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                      >
                        {isLoadingThis ? 'Equipping...' : 'Equip Item'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyItem(item)}
                        disabled={!canAfford || isLoadingThis}
                        className={`w-full py-2.5 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <span>🪙</span>
                        <span>{isLoadingThis ? 'Buying...' : `Buy for ${item.price.toLocaleString()} Coins`}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
