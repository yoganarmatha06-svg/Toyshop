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

  // Motion values for smooth 3D tilt effect (-0.5 to 0.5 relative to card center)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 300, mass: 0.6 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-6, 6]);

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

  const cardVariants = {
    rest: {
      y: 0,
      scale: 1,
      boxShadow:
        '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
      borderColor: 'rgba(241, 245, 249, 1)',
      zIndex: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
    hover: {
      y: -8,
      scale: 1.03,
      boxShadow:
        '0 20px 25px -5px rgba(244, 114, 182, 0.25), 0 8px 10px -6px rgba(244, 114, 182, 0.15)',
      borderColor: 'rgba(244, 114, 182, 0.6)',
      zIndex: 10,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  // Get dynamic image stored in MongoDB category.image
  const catImg = getCategoryImage(category);

  return (
    <div className="h-full [perspective:1000px]" style={{ perspective: 1000 }}>
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
        className="relative rounded-3xl bg-white border border-slate-100 block h-full cursor-pointer overflow-hidden group shadow-xs transition-colors"
      >
        <Link
          to={`/shop?category=${category._id}`}
          className="flex flex-col h-full p-3 sm:p-4 focus:outline-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Consistent aspect-ratio category image container with smooth hover zoom */}
          <div
            className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 relative mb-3 shadow-xs"
            style={{ transform: 'translateZ(15px)' }}
          >
            <img
              src={catImg.src}
              alt={category.name || 'Toy Category'}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 select-none"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>

          {/* Category Info below the image */}
          <div
            className="flex flex-col items-center text-center mt-auto"
            style={{ transform: 'translateZ(10px)' }}
          >
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 group-hover:text-pink-600 transition-colors font-heading line-clamp-1">
              {category.name}
            </h3>

            <span
              className="mt-1.5 sm:mt-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black text-white bg-green-600 shadow-xs inline-flex items-center gap-1 transition-transform duration-300 group-hover:scale-105 select-none"
              style={{ backgroundColor: '#16a34a' }}
            >
              Explore Now
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
};

export default CategoryCard;
