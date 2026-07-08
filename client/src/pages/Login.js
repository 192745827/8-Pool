import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';
export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const setUser = useGameStore((state) => state.setUser);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
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
        }
        catch (err) {
            console.error('Login error:', err);
            const msg = err.response?.data?.error || 'Failed to sign in. Please check your credentials.';
            setError(msg);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-md mx-auto w-full px-6 py-8 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl", children: [_jsx("h2", { className: "text-3xl font-extrabold tracking-wider font-display mb-2 text-center text-white", children: "SIGN IN" }), _jsx("p", { className: "text-slate-400 text-xs font-body text-center mb-8", children: "Access your account and track your pool stats" }), error && (_jsxs("div", { className: "mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-xl text-center", children: ["\u26A0\uFE0F ", error] })), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-display", children: "Username or Email" }), _jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.target.value), placeholder: "Enter username or email", className: "w-full px-4 py-3 bg-pool-dark/50 border border-white/10 focus:border-pool-cyan focus:outline-none rounded-xl text-white font-body transition-all duration-200 text-sm", disabled: isLoading })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-display", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter password", className: "w-full px-4 py-3 bg-pool-dark/50 border border-white/10 focus:border-pool-cyan focus:outline-none rounded-xl text-white font-body transition-all duration-200 text-sm", disabled: isLoading })] }), _jsx("button", { type: "submit", className: "w-full py-3 px-6 bg-gradient-to-r from-pool-cyan to-pool-cyan/80 hover:from-pool-cyan/95 hover:to-pool-cyan/75 text-pool-dark font-display font-bold rounded-xl shadow-lg shadow-pool-cyan/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none", disabled: isLoading, children: isLoading ? 'Signing In...' : 'Enter Game' })] }), _jsxs("p", { className: "mt-8 text-center text-sm text-slate-400 font-body", children: ["New player?", ' ', _jsx(Link, { to: "/register", className: "text-pool-cyan hover:underline font-semibold", children: "Register here" })] })] }));
};
export default Login;
