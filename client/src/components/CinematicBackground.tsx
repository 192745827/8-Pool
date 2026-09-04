import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const CinematicBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position between -1 and 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [shouldReduceMotion]);

  // Generate particles for atmospheric dust
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2.5 + 1,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    duration: Math.random() * 40 + 30, // Extremely slow movement
    delay: Math.random() * -50,
  }));

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none selection:bg-transparent">
      
      {/* 1. PHOTOREALISTIC BACKGROUND LAYER */}
      {/* 
        This is the generated high-quality cinematic render. 
        We apply a very slow continuous scale to give a subtle "breathing" cinematic effect,
        plus a tiny bit of parallax tied to mouse movement.
      */}
      <motion.div
        animate={shouldReduceMotion ? {} : {
          scale: [1.05, 1.1, 1.05],
          x: mousePos.x * -15,
          y: mousePos.y * -8,
        }}
        transition={{
          scale: { duration: 60, repeat: Infinity, ease: "easeInOut" },
          x: { type: "tween", ease: "easeOut", duration: 2 },
          y: { type: "tween", ease: "easeOut", duration: 2 }
        }}
        className="absolute inset-0 w-full h-full bg-[url('/bg-cinematic.jpg')] bg-cover bg-center"
      >
        {/* Dark vignette overlay to ensure text/UI readability */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(0,0,0,0.85)_100%)]" />
        <div className="absolute inset-0 bg-[#080b10]/40 mix-blend-multiply" />
      </motion.div>

      {/* 2. ATMOSPHERIC PARTICLES (Dust Motes) */}
      <div 
        className="absolute inset-0 z-0"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)' }}
      >
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-pool-cyan/30 blur-[1px]"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.initialX}%`,
              top: `${p.initialY}%`,
            }}
            animate={shouldReduceMotion ? {} : {
              y: [0, -400],
              x: [0, Math.sin(p.id) * 80],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* 3. CINEMATIC FLOATING TEXTS (Matching Reference Image) */}
      {/* Left Text Layer */}
      <motion.div
        animate={shouldReduceMotion ? {} : {
          x: mousePos.x * -5,
          y: mousePos.y * -3,
        }}
        transition={{ type: "tween", ease: "easeOut", duration: 4 }}
        className="absolute left-[8%] top-1/2 -translate-y-1/2 flex flex-col gap-4 hidden md:flex opacity-60 mix-blend-plus-lighter"
      >
        <span className="text-[#3a5d65] font-display font-medium tracking-[0.45em] text-sm lg:text-lg uppercase">
          Good Players
        </span>
        <span className="text-[#3a5d65] font-display font-medium tracking-[0.45em] text-sm lg:text-lg uppercase">
          Make Shots
        </span>
        <span className="text-[#3a5d65] font-display font-medium tracking-[0.45em] text-sm lg:text-lg uppercase">
          Great Players
        </span>
        <span className="text-[#3a5d65] font-display font-medium tracking-[0.45em] text-sm lg:text-lg uppercase">
          Make History
        </span>
      </motion.div>

      {/* Right Text Layer */}
      <motion.div
        animate={shouldReduceMotion ? {} : {
          x: mousePos.x * -7,
          y: mousePos.y * -4,
        }}
        transition={{ type: "tween", ease: "easeOut", duration: 4 }}
        className="absolute right-[8%] top-1/2 -translate-y-1/2 flex flex-col gap-6 text-right hidden lg:flex opacity-[0.15] mix-blend-plus-lighter"
      >
        <span className="text-[#3a5d65] font-display font-bold italic tracking-[0.2em] text-4xl xl:text-6xl uppercase">
          Play
        </span>
        <span className="text-[#3a5d65] font-display font-bold italic tracking-[0.2em] text-4xl xl:text-6xl uppercase">
          Practice
        </span>
        <span className="text-[#3a5d65] font-display font-bold italic tracking-[0.2em] text-4xl xl:text-6xl uppercase">
          Improve
        </span>
        <span className="text-[#3a5d65] font-display font-bold italic tracking-[0.2em] text-4xl xl:text-6xl uppercase">
          Win
        </span>
      </motion.div>
    </div>
  );
};

export default CinematicBackground;
