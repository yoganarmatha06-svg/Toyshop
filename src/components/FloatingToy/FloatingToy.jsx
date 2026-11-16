import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Premium 3D Floating Toy Component
 * - Smooth continuous floating up/down, drift, and 3D tilt.
 * - Gentle ambient pastel glow.
 * - Smooth spring hover effect without any intrusive click popups or speech bubbles.
 */
const FloatingToy = ({
  src,
  alt = 'Floating Toy',
  className = '',
  floatDuration = 4.5,
  driftDuration = 6,
  rotateDuration = 7,
  delay = 0,
  floatRange = 12,
  driftRange = 7,
  rotateRange = 6,
  scaleRange = 0.03,
  glowColor = 'rgba(244, 114, 182, 0.35)',
  onClick,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Continuous ambient float & drift animation
  const floatAnimation = shouldReduceMotion
    ? {}
    : {
        y: [-floatRange, floatRange, -floatRange],
        x: [-driftRange, driftRange, -driftRange],
        rotateZ: [-rotateRange, rotateRange, -rotateRange],
        rotateY: [-rotateRange * 1.5, rotateRange * 1.5, -rotateRange * 1.5],
        scale: [1, 1 + scaleRange, 1],
      };

  const floatTransition = shouldReduceMotion
    ? {}
    : {
        y: {
          duration: floatDuration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay,
        },
        x: {
          duration: driftDuration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: delay + 0.3,
        },
        rotateZ: {
          duration: rotateDuration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: delay + 0.5,
        },
        rotateY: {
          duration: rotateDuration * 1.2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay,
        },
        scale: {
          duration: floatDuration * 1.1,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: delay + 0.2,
        },
      };

  return (
    <motion.div
      animate={floatAnimation}
      transition={floatTransition}
      whileHover={{
        scale: 1.12,
        y: -8,
        rotateZ: 4,
        transition: { type: 'spring', stiffness: 350, damping: 18 },
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative select-none will-change-transform group pointer-events-auto ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 900,
      }}
    >
      {/* Ambient Pastel Glow Behind Toy */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-40 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none -z-10"
        style={{ backgroundColor: glowColor }}
      />

      {/* Realistic 3D Toy Image with Drop Shadow */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_10px_14px_rgba(0,0,0,0.12)] group-hover:drop-shadow-[0_18px_24px_rgba(0,0,0,0.18)] transition-all duration-300"
        loading="lazy"
        draggable={false}
      />
    </motion.div>
  );
};

export default FloatingToy;
