import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (coins: number, xp: number) => void;
}

interface CalendarDay {
  day: number;
  coins: number;
  xp: number;
  item: string | null;
  title: string;
  icon: string;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [streak, setStreak] = useState<number>(0);
  const [canClaimToday, setCanClaimToday] = useState<boolean>(false);
  const [claimedDays, setClaimedDays] = useState<number[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [nextDayToClaim, setNextDayToClaim] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/daily-rewards/status');
      setStreak(res.data.streak);
      setCanClaimToday(res.data.canClaimToday);
      setClaimedDays(res.data.claimedDays || []);
      setCalendar(res.data.calendar || []);
      setNextDayToClaim(res.data.nextDayToClaim);
    } catch (err) {
      console.error('Failed to fetch daily rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await api.post('/api/daily-rewards/claim');
      setStreak(res.data.streak);
      setCanClaimToday(false);
      setClaimedDays(res.data.claimedDays);
      setNextDayToClaim(null);

      setToastMessage(`🎁 Successfully claimed Day ${res.data.streak} Reward!`);

      if (onRewardClaimed) {
        onRewardClaimed(res.data.coins, res.data.xp);
      }
    } catch (err: any) {
      setToastMessage(`⚠️ ${err.response?.data?.message || 'Failed to claim'}`);
    } finally {
      setClaiming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden text-center">
        {/* Glowing top line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-cyan-400 shadow-[0_0_15px_#eab308]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-left">
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
              LOGIN STREAK: {streak} DAYS
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              🎁 7-Day Daily Login Rewards
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* 7-Day Calendar Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading daily rewards...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {calendar.map((dayObj) => {
              const isClaimed = claimedDays.includes(dayObj.day);
              const isTodayTarget = canClaimToday && nextDayToClaim === dayObj.day;
              const isDay7 = dayObj.day === 7;

              return (
                <div
                  key={dayObj.day}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-between relative overflow-hidden ${
                    isDay7 ? 'col-span-2 sm:col-span-2 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/40' : ''
                  } ${
                    isClaimed
                      ? 'bg-slate-950/60 border-slate-800 opacity-60'
                      : isTodayTarget
                      ? 'bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.03]'
                      : 'bg-slate-950/40 border-slate-800/80'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-400 mb-2">
                    <span>Day {dayObj.day}</span>
                    {isClaimed ? (
                      <span className="text-emerald-400 font-black">CLAIMED ✔</span>
                    ) : isTodayTarget ? (
                      <span className="text-cyan-400 font-black animate-pulse">READY 🎁</span>
                    ) : (
                      <span>🔒</span>
                    )}
                  </div>

                  <div className="text-3xl my-2">{dayObj.icon}</div>

                  <p className="text-xs font-black text-white text-center">
                    {dayObj.title}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Claim Action Button */}
        <div className="pt-2">
          {canClaimToday ? (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {claiming ? 'Claiming Reward...' : `🎁 CLAIM DAY ${nextDayToClaim || 1} REWARD NOW`}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3.5 bg-slate-800 text-slate-500 font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-700 cursor-not-allowed text-center"
            >
              ✔ TODAY'S REWARD CLAIMED (COME BACK TOMORROW)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyRewardsModal;
