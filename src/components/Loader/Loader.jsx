import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false, text = 'Loading ToyVerse wonders...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <motion.div
          animate={{
            y: [-12, 0, -12],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            ease: 'easeInOut',
          }}
          className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-300/50"
        >
          🧸
        </motion.div>
        <motion.div
          animate={{
            y: [-12, 0, -12],
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            delay: 0.15,
            ease: 'easeInOut',
          }}
          className="w-12 h-12 rounded-2xl bg-pink-400 flex items-center justify-center text-2xl shadow-lg shadow-pink-300/50"
        >
          🎮
        </motion.div>
        <motion.div
          animate={{
            y: [-12, 0, -12],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            delay: 0.3,
            ease: 'easeInOut',
          }}
          className="w-12 h-12 rounded-2xl bg-sky-400 flex items-center justify-center text-2xl shadow-lg shadow-sky-300/50"
        >
          🚀
        </motion.div>
      </div>
      <p className="text-sm font-semibold text-slate-600 animate-pulse font-heading tracking-wide">
        {text}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-50/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="py-16 flex items-center justify-center">{content}</div>;
};

export default Loader;

