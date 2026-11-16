import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Star,
  Gift,
  Smile,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import Loader from '../../components/Loader/Loader';
import FloatingToy from '../../components/FloatingToy/FloatingToy';
import toyBanner from '../../assets/toybanner1.png';
import banner2 from '../../assets/banner 2.png';
import teddyBearImg from '../../assets/t1-removebg-preview.png';
import t2Img from '../../assets/t2-removebg-preview.png';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Hero Banners Slider
  const heroBanners = [
    {
      id: 1,
      src: toyBanner,
      alt: 'Toy World - Play Learn Grow',
      link: '/shop',
    },
    {
      id: 2,
      src: banner2,
      alt: 'Toy World - Explore Wonders',
      link: '/shop',
    },
  ];

  const [currentBanner, setCurrentBanner] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  // Auto-slide to next banner with smooth 0.2s transition
  useEffect(() => {
    if (isBannerHovered) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isBannerHovered, heroBanners.length]);

  // Smooth scroll progress bar across page
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Track scroll position for floating back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, featRes, bestRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/featured'),
          api.get('/products/bestsellers'),
        ]);
        setCategories(catRes.data || []);
        setFeaturedProducts(featRes.data || []);
        setBestSellers(bestRes.data || []);
      } catch (err) {
        console.error('Error loading home data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader fullScreen text="Opening the Magic Toy Chest..." />;
  }

  // Animation variants for staggered grid reveals
  const containerStagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemFadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="space-y-16 pb-12 overflow-hidden relative">
      {/* Top Colorful Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 z-50 origin-left shadow-xs"
        style={{ scaleX }}
      />

      {/* Full-Width Edge-to-Edge Hero Banner Carousel */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onMouseEnter={() => setIsBannerHovered(true)}
        onMouseLeave={() => setIsBannerHovered(false)}
        className="relative w-full overflow-hidden select-none group"
      >
        {/* Banner Track with 0.1s Ultra-Fast Smooth Slide */}
        <motion.div
          className="flex w-full"
          animate={{ x: `-${currentBanner * 100}%` }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
        >
          {heroBanners.map((banner) => (
            <div key={banner.id} className="w-full shrink-0 flex-shrink-0">
              <Link to={banner.link} className="block w-full focus:outline-none">
                <img
                  src={banner.src}
                  alt={banner.alt}
                  className="w-full aspect-[2.67/1] object-contain sm:object-cover object-center block select-none bg-gradient-to-r from-pink-50/50 via-purple-50/50 to-pink-50/50"
                />
              </Link>
            </div>
          ))}
        </motion.div>

        {/* Left Side Arrow Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            prevBanner();
          }}
          aria-label="Previous Banner"
          className="absolute left-1.5 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-white/85 hover:bg-white text-slate-800 hover:text-pink-600 shadow-md hover:shadow-xl backdrop-blur-xs flex items-center justify-center transition-all duration-200 active:scale-90 group/arrow focus:outline-none opacity-90 hover:opacity-100 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-6 sm:h-6 transition-transform group-hover/arrow:-translate-x-0.5" />
        </button>

        {/* Right Side Arrow Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            nextBanner();
          }}
          aria-label="Next Banner"
          className="absolute right-1.5 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-white/85 hover:bg-white text-slate-800 hover:text-pink-600 shadow-md hover:shadow-xl backdrop-blur-xs flex items-center justify-center transition-all duration-200 active:scale-90 group/arrow focus:outline-none opacity-90 hover:opacity-100 cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-6 sm:h-6 transition-transform group-hover/arrow:translate-x-0.5" />
        </button>

        {/* Bottom Pagination Dots */}
        <div className="absolute bottom-1.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-slate-900/35 backdrop-blur-xs px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full">
          {heroBanners.map((banner, idx) => (
            <button
              key={banner.id}
              onClick={() => setCurrentBanner(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 cursor-pointer ${
                currentBanner === idx
                  ? 'w-4 sm:w-6 bg-pink-500 shadow-xs'
                  : 'w-1.5 sm:w-2 bg-white/70 hover:bg-white'
              }`}
              aria-label={`Go to banner ${idx + 1}`}
            />
          ))}
        </div>
      </motion.section>

      {/* Quick Highlights / Trust Bar - Scroll Stagger */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerStagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4"
        >
          <motion.div
            variants={itemFadeUp}
            className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3.5 p-3 sm:p-4 bg-pink-50/80 border border-pink-100 rounded-2xl shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 font-heading">Free Delivery</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">On orders over ₹999</p>
            </div>
          </motion.div>

          <motion.div
            variants={itemFadeUp}
            className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3.5 p-3 sm:p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 font-heading">100% Certified Safe</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Child-friendly & non-toxic</p>
            </div>
          </motion.div>

          <motion.div
            variants={itemFadeUp}
            className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3.5 p-3 sm:p-4 bg-amber-50/80 border border-amber-100 rounded-2xl shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 font-heading">10 Toy Categories</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Teddy, RC cars & more</p>
            </div>
          </motion.div>

          <motion.div
            variants={itemFadeUp}
            className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3.5 p-3 sm:p-4 bg-purple-50/80 border border-purple-100 rounded-2xl shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 font-heading">4.9 / 5 Rating</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Loved by 10,000+ kids</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 10 Toy Categories Section - Centered & Dynamic Scroll Stagger */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative"
      >
        {/* Floating Pink Teddy Bear at Left Corner - Hidden on small mobile to avoid overflow */}
        <div className="hidden sm:block absolute -top-10 sm:-top-14 md:-top-16 left-1 sm:left-4 lg:-left-6 z-20 pointer-events-none">
          <FloatingToy
            src={teddyBearImg}
            alt="Explore Categories Pink Teddy Bear"
            className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32"
            floatDuration={4.4}
            driftDuration={5.6}
            rotateDuration={6.5}
            floatRange={10}
            driftRange={6}
            rotateRange={8}
            glowColor="rgba(244, 114, 182, 0.45)"
          />
        </div>

        {/* Floating 3D Toy (t2) at Right Side Corner - Hidden on small mobile */}
        <div className="hidden sm:block absolute top-4 sm:top-6 md:top-8 -right-2 sm:right-2 lg:-right-6 z-20 pointer-events-none">
          <FloatingToy
            src={t2Img}
            alt="Explore Categories 3D Teddy Bear"
            className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32"
            floatDuration={4.8}
            driftDuration={6.2}
            rotateDuration={7.2}
            delay={0.4}
            floatRange={11}
            driftRange={7}
            rotateRange={8}
            glowColor="rgba(251, 146, 60, 0.45)"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto mb-10 space-y-2"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-pink-600 uppercase tracking-widest px-3.5 py-1 bg-pink-50 rounded-full border border-pink-100"
          >
            <Gift className="w-4 h-4 text-pink-500" /> Discover by Interest
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-black text-slate-900 font-heading"
          >
            Explore 10 Toy Categories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-sm text-slate-500 font-medium"
          >
            Find the perfect playtime magic tailored for every age, hobby, and imagination.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 40,
                  scale: 0.88,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 280,
                    damping: 20,
                  },
                },
              }}
            >
              <CategoryCard category={cat} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 hover:text-pink-700 text-sm font-bold border border-pink-200 transition-all shadow-xs hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Explore All Toys</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.section>

      {/* Featured Toys Section - Immediate Visibility (No Scroll Animations) */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center justify-center text-xs font-bold text-amber-600 uppercase tracking-widest px-3.5 py-1 bg-amber-50 rounded-full border border-amber-100">
              Handpicked Wonders
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              Featured Toys
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Handpicked treasures guaranteed to bring boundless fun, learning, and wonder.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.slice(0, 12).map((product) => (
              <div key={product._id} className="h-full">
                <ProductCard product={product} isFeaturedSection={true} />
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 hover:text-pink-700 text-sm font-bold border border-pink-200 transition-all shadow-xs hover:shadow-sm"
            >
              <span>Explore Full Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Best-Selling Toys Section - Scroll Entrance & Stagger */}
      {bestSellers.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-widest px-3.5 py-1 bg-rose-50 rounded-full border border-rose-100">
              <Star className="w-4 h-4 fill-current text-rose-500" /> Customer Favorites
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              Best-Selling Toys
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              The most loved toys bringing joy to thousands of smiling kids across India.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerStagger}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
          >
            {bestSellers.slice(0, 8).map((product) => (
              <motion.div key={product._id} variants={itemFadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mt-10"
          >
            <Link
              to="/shop?sort=popular"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 hover:text-pink-700 text-sm font-bold border border-pink-200 transition-all shadow-xs hover:shadow-sm"
            >
              <span>View All Best Sellers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.section>
      )}

      {/* Why Choose ToyVerse Section - Scroll Reveal */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-amber-50/70 rounded-3xl p-8 sm:p-12 border border-amber-100 text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              The Toy World Promise
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Why Parents Trust Our Toy Shop
            </h3>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={containerStagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={itemFadeUp}
              className="p-6 bg-white rounded-2xl shadow-xs border border-amber-100/60 flex flex-col items-center hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-2xl mb-4">
                🛡️
              </div>
              <h4 className="font-bold text-slate-900 font-heading mb-2">100% Non-Toxic & Safe</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                All toys strictly comply with international safety norms and BIS certification standards with zero sharp edges.
              </p>
            </motion.div>

            <motion.div
              variants={itemFadeUp}
              className="p-6 bg-white rounded-2xl shadow-xs border border-amber-100/60 flex flex-col items-center hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mb-4">
                🧩
              </div>
              <h4 className="font-bold text-slate-900 font-heading mb-2">Brain & Skill Development</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Curated by early childhood educators to stimulate cognitive reasoning, tactile sensory skills, and imaginative play.
              </p>
            </motion.div>

            <motion.div
              variants={itemFadeUp}
              className="p-6 bg-white rounded-2xl shadow-xs border border-amber-100/60 flex flex-col items-center hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-2xl mb-4">
                💳
              </div>
              <h4 className="font-bold text-slate-900 font-heading mb-2">Secure Online Payments</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bank-grade encrypted 256-bit checkout powered by Razorpay with card, UPI, net banking, and COD options.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Floating Scroll to Top Rocket Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.12, y: -4 }}
            whileTap={{ scale: 0.92 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl shadow-pink-300/50 hover:shadow-2xl hover:shadow-pink-300/70 border-2 border-white flex items-center justify-center cursor-pointer transition-shadow group"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
