import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Burst {
  id: number;
  x: number;
  y: number;
  z: number;
  color: string;
  type: 'pocket' | 'strike';
}

interface ParticleContextProps {
  bursts: Burst[];
  confettiActive: boolean;
  triggerPocketBurst: (x: number, y: number, z: number, color?: string) => void;
  triggerStrikeFlash: (x: number, y: number, z: number) => void;
  triggerConfetti: (active: boolean) => void;
  clearBurst: (id: number) => void;
}

const ParticleContext = createContext<ParticleContextProps | undefined>(undefined);

export const ParticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [confettiActive, setConfettiActive] = useState(false);

  /**
   * Spawns a pocket drop splash.
   */
  const triggerPocketBurst = useCallback((x: number, y: number, z: number, color: string = '#00ffff') => {
    setBursts((prev) => [...prev, { id: Date.now() + Math.random(), x, y, z, color, type: 'pocket' }]);
  }, []);

  /**
   * Spawns a cue strike impact flash.
   */
  const triggerStrikeFlash = useCallback((x: number, y: number, z: number) => {
    setBursts((prev) => [...prev, { id: Date.now() + Math.random(), x, y, z, color: '#ffffff', type: 'strike' }]);
  }, []);

  /**
   * Toggles victory confetti state.
   */
  const triggerConfetti = useCallback((active: boolean) => {
    setConfettiActive(active);
  }, []);

  /**
   * Removes concluded bursts.
   */
  const clearBurst = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <ParticleContext.Provider value={{ bursts, confettiActive, triggerPocketBurst, triggerStrikeFlash, triggerConfetti, clearBurst }}>
      {children}
    </ParticleContext.Provider>
  );
};

export const useParticles = () => {
  const context = useContext(ParticleContext);
  if (!context) {
    throw new Error('useParticles must be used within a ParticleProvider');
  }
  return context;
};

export default ParticleProvider;
