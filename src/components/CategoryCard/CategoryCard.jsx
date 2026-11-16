import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { getCategoryImage } from '../../utils/categoryAssets';

const CategoryCard = ({ category }) => {
  const [canHover, setCanHover] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  // Motion values for mouse coordinates (-0.5 to 0.5 relative to card center)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth 60 FPS physics-based spring configuration
  const springConfig = { damping: 20, stiffness: 300, mass: 0.6 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  // 3D perspective tilt calculations (-8deg to 8deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);

  // Check for mouse pointer vs touch device on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
      setCanHover(mq.matches);
      const listener = (e) => setCanHover(e.matches);
      mq.addEventListener?.('change', listener);
      return () => mq.removeEventListener?.('change', listener);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (!canHover || shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Card lift, glowing shadow and border variants
  const cardVariants = {
    rest: {
      y: 0,
      scale: 1,
      boxShadow:
        '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      borderColor: 'rgba(241, 245, 249, 1)',
      zIndex: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
    hover: {
      y: -10,
      scale: 1.04,
      boxShadow:
        '0 20px 30px -10px rgba(244, 114, 182, 0.35), 0 12px 24px -8px rgba(168, 85, 247, 0.25), 0 0 18px 2px rgba(244, 114, 182, 0.25)',
      borderColor: 'rgba(244, 114, 182, 0.85)',
      zIndex: 20,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  // Toy icon playful bounce and rotation variants
  const iconVariants = {
    rest: {
      scale: 1,
      rotate: 0,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
    hover: {
      scale: 1.15,
      rotate: [0, -8, 8, -4, 0],
      y: [0, -3, 0],
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse',
        repeatDelay: 0.6,
      },
    },
  };

  const catImg = getCategoryImage(category);

  return (
    <div
      className="h-full [perspective:1000px]"
      style={{ perspective: 1000 }}
    >
      <motion.div
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.97 }}
        variants={cardVariants}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        className="relative rounded-3xl bg-white border border-slate-100 block h-full cursor-pointer overflow-visible"
      >
        <Link
          to={`/shop?category=${category._id}`}
          className="group relative flex flex-col items-center p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl text-center block h-full focus:outline-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Soft pastel background splash container */}
          <div
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-4xl mb-2 sm:mb-3 overflow-hidden shadow-xs relative"
            style={{
              backgroundColor: catImg ? '#FFFFFF' : (category.color || '#FEE2E2'),
              transform: 'translateZ(20px)',
            }}
          >
            {catImg ? (
              <motion.img
                src={catImg.src}
                alt={catImg.alt}
                variants={shouldReduceMotion ? {} : iconVariants}
                className={`w-full h-full ${catImg.fit === 'contain' ? 'object-contain p-1' : 'object-cover'} rounded-xl sm:rounded-2xl select-none`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80';
                }}
              />
            ) : (
              <motion.span
                variants={shouldReduceMotion ? {} : iconVariants}
                className="inline-block select-none"
              >
                {category.icon || '🧸'}
              </motion.span>
            )}
          </div>

          <h3
            className="text-xs sm:text-base font-bold text-slate-800 group-hover:text-pink-600 transition-colors font-heading line-clamp-1"
            style={{ transform: 'translateZ(15px)' }}
          >
            {category.name}
          </h3>

          <span
            className="mt-1.5 sm:mt-2.5 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black text-white bg-green-600 shadow-xs inline-flex items-center gap-1 transition-transform duration-300 group-hover:scale-105 select-none"
            style={{ backgroundColor: '#16a34a', transform: 'translateZ(10px)' }}
          >
            Explore Now
          </span>
        </Link>
      </motion.div>
    </div>
  );
};

export default CategoryCard;
