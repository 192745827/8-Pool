import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { BiChevronRight } from 'react-icons/bi';

export const Login: React.FC = () => {
  const [username, setUsername] = useState(() => localStorage.getItem('remembered_username') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('remember_me') !== 'false');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useGameStore((state) => state.setUser);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username or Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/users/login', { 
        username: username.trim(),
        password 
      });
      
      const { _id, username: returnedUsername, email, avatar, coins, xp, wins, losses, rank, token } = response.data;

      // Save token to localStorage
      if (token) {
        localStorage.setItem('token', token);
      }

      // Remember credentials if checked
      if (rememberMe) {
        localStorage.setItem('remembered_username', username.trim());
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remembered_username');
        localStorage.setItem('remember_me', 'false');
      }

      // Update Zustand store
      setUser({
        id: _id,
        username: returnedUsername,
        email,
        avatar,
        coins,
        xp,
        wins,
        losses,
        rank,
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.error || 
        (err.response 
          ? 'Failed to sign in. Please check your credentials.'
          : 'Unable to connect to the server. Please check your connection.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-md mx-auto w-full relative z-10"
    >
      {/* Decorative Top 8-Ball */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2a2d35] to-[#0a0d14] border-[1.5px] border-[#3a3d45] shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15)_0%,transparent_60%)]"></div>
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-inner relative z-10">
             <span className="text-[#0a0d14] font-black text-[11px] leading-none">8</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[#12141a]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 pt-12 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-pool-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-pool-felt/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <p className="text-pool-cyan text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
            Player Access
          </p>
          <h2 className="text-3xl font-black tracking-widest font-display text-white mb-2">
            WELCOME BACK
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Enter the arena and continue your climb.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium rounded-xl flex items-center gap-3">
                <div className="w-1 self-stretch bg-rose-500 rounded-full" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col relative z-10">
          <div className="space-y-5">
            {/* Username Input */}
            <div className="group">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-display transition-colors group-focus-within:text-pool-cyan">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-pool-cyan transition-colors">
                  <FiUser size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your credentials"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0a0d14] border border-white/5 rounded-xl text-white font-body text-sm placeholder:text-slate-600 focus:outline-none focus:border-pool-cyan focus:ring-1 focus:ring-pool-cyan/50 transition-all shadow-inner"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-display transition-colors group-focus-within:text-pool-cyan">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-pool-cyan transition-colors">
                  <FiLock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 bg-[#0a0d14] border border-white/5 rounded-xl text-white font-body text-sm placeholder:text-slate-600 focus:outline-none focus:border-pool-cyan focus:ring-1 focus:ring-pool-cyan/50 transition-all shadow-inner"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center group cursor-pointer" onClick={() => !isLoading && setRememberMe(!rememberMe)}>
            <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ease-in-out border border-white/5 ${rememberMe ? 'bg-pool-cyan/20 border-pool-cyan/50' : 'bg-[#0a0d14]'}`}>
              <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full shadow-sm transition-all duration-300 ease-in-out ${rememberMe ? 'bg-pool-cyan translate-x-5' : 'bg-slate-500 translate-x-0'}`} />
            </div>
            <span className="ml-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-display select-none group-hover:text-slate-200 transition-colors">
              Remember Me
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full mt-8 py-4 bg-gradient-to-r from-[#94a3b8] to-[#64748b] rounded-xl font-display font-black text-sm uppercase tracking-[0.15em] text-[#080b10] overflow-hidden group shadow-[0_0_20px_rgba(148,163,184,0.2)] hover:shadow-[0_0_30px_rgba(148,163,184,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {/* Light Sweep Effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-sweep skew-x-12" />
            
            <div className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#080b10]/20 border-t-[#080b10] rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Enter The Arena</span>
                  <BiChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
          <p className="text-sm text-slate-400 font-medium">
            New player?{' '}
            <Link to="/register" className="text-pool-cyan font-bold hover:text-white transition-colors relative group inline-block">
              Create your account
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pool-cyan transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
