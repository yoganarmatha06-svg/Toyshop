import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Smile,
  Heart,
  ArrowRight,
  Gift,
  Star,
  CheckCircle2,
} from 'lucide-react';
import toyLogo from '../../assets/logo.png';

const About = () => {
  const highlights = [
    {
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      title: 'Quality You Can Trust',
      description: 'We offer carefully selected toys with a focus on quality and safety.',
    },
    {
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      title: 'Affordable Prices',
      description: 'Enjoy amazing toys at prices that make every purchase worthwhile.',
    },
    {
      icon: Smile,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      title: 'Fun for Every Age',
      description: 'Discover toys for babies, toddlers, kids, and growing children.',
    },
    {
      icon: ShoppingBag,
      color: 'bg-pink-50 text-pink-600 border-pink-200',
      title: 'Easy Shopping',
      description: 'Enjoy a simple, smooth, and convenient online shopping experience.',
    },
    {
      icon: Truck,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
      title: 'Happiness Delivered',
      description: 'We bring your favorite toys right to your doorstep.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/40 via-white to-purple-50/30 py-6 sm:py-12">
      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* Back to Home Button */}
        <div className="flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-pink-50 text-slate-900 hover:text-pink-600 text-xs sm:text-sm font-extrabold transition-all border-2 border-slate-900 shadow-sm hover:shadow-md active:scale-95 group cursor-pointer"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-slate-900 group-hover:text-pink-600" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header / Hero Container Card */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-12 border-2 border-slate-900 shadow-xl text-center space-y-5">
          {/* Decorative Background Blob */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-pink-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs sm:text-sm font-extrabold font-heading shadow-xs">
            <Sparkles className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span>Welcome to Toy World!</span>
          </div>

          {/* Page Heading */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight flex flex-wrap justify-center gap-x-2.5">
            {['About', 'Toy', 'World'].map((word, idx) => (
              <span
                key={idx}
                className="inline-block animate-word-reveal"
                style={{ animationDelay: `${120 + idx * 160}ms` }}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Tagline */}
          <p
            className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-rose-500 font-heading animate-text-fade-up"
            style={{ animationDelay: '520ms' }}
          >
            Where Every Toy Creates a New Adventure!
          </p>

          {/* Welcome Intro Paragraph */}
          <p
            className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed animate-text-fade-up"
            style={{ animationDelay: '680ms' }}
          >
            At Toy World, we believe that every child deserves a world full of happiness, creativity,
            and imagination. We offer a wonderful collection of toys that bring smiles to
            children's faces and create beautiful childhood memories. From adorable soft toys to
            exciting educational games, we have something special for every little one.
          </p>
        </div>

        {/* Our Story Container Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-900 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl shadow-xs">
              📖
            </div>
            <h2
              className="text-2xl sm:text-3xl font-black text-slate-900 font-heading animate-text-slide-left"
              style={{ animationDelay: '300ms' }}
            >
              Our Story
            </h2>
          </div>

          <p
            className="text-sm sm:text-base text-slate-700 leading-relaxed animate-text-fade-up"
            style={{ animationDelay: '460ms' }}
          >
            Toy World was created with a simple idea – to make childhood more joyful and memorable.
            We believe toys are not just for playing; they help children learn, explore, imagine, and
            grow. Our collection is carefully selected to bring fun, creativity, and happiness to
            every home.
          </p>
        </div>

        {/* Why Choose Toy World? Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2
              className="text-2xl sm:text-4xl font-black text-slate-900 font-heading animate-text-elegant"
              style={{ animationDelay: '350ms' }}
            >
              Why Choose Toy World?
            </h2>
            <p
              className="text-xs sm:text-sm text-slate-500 font-medium animate-text-fade-up"
              style={{ animationDelay: '500ms' }}
            >
              Dedicated to bringing safety, wonder, and endless smiles to your family
            </p>
          </div>

          {/* 5 Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {highlights.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900 shadow-sm hover:shadow-md transition-all space-y-3 ${
                    idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.color}`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3
                    className="text-base sm:text-lg font-black text-slate-900 font-heading animate-stagger-title"
                    style={{ animationDelay: `${400 + idx * 120}ms` }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-xs sm:text-sm text-slate-600 leading-relaxed animate-stagger-desc"
                    style={{ animationDelay: `${480 + idx * 120}ms` }}
                  >
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Closing Call to Action Container Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white p-8 sm:p-12 border-2 border-slate-900 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/20 text-3xl mx-auto flex items-center justify-center backdrop-blur-xs mb-2">
            🎈
          </div>

          <h3
            className="text-2xl sm:text-4xl font-black font-heading animate-cta-text"
            style={{ animationDelay: '350ms' }}
          >
            Let's Make Childhood Magical!
          </h3>

          <p
            className="text-sm sm:text-base text-white/95 max-w-2xl mx-auto leading-relaxed animate-cta-text"
            style={{ animationDelay: '480ms' }}
          >
            Explore our exciting toy collection and find the perfect toy for your little one's next
            adventure.
          </p>

          <p
            className="text-base sm:text-xl font-black tracking-wide pt-2 font-heading animate-cta-text"
            style={{ animationDelay: '600ms' }}
          >
            ✨ Toy World – Play More, Smile More! ✨
          </p>

          <div className="pt-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-black text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              <span className="inline-block transition-transform duration-200 group-hover:scale-105">
                Explore Our Toys
              </span>
              <ArrowRight className="w-4 h-4 text-pink-600 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
