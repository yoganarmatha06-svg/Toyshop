import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Address from '../models/Address.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async ({ force = false } = {}) => {
  try {
    console.log(' Checking database store catalogue...');

    if (force) {
      console.warn('⚠️ Force reset requested: clearing product/category catalogue...');
      await Category.deleteMany();
      await Product.deleteMany();
      await Review.deleteMany();
    }

    // 1. Create or retrieve Admin & Demo users without wiping registered customer accounts
    let adminUser = await User.findOne({ email: 'admin@toystore.com' });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('AdminPassword123!', salt);
      adminUser = await User.create({
        name: 'Store Administrator',
        email: 'admin@toystore.com',
        password: adminPassword,
        role: 'admin',
        phone: '+91 9876543210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      });
      console.log(' Created Admin user (admin@toystore.com)');
    }

    let demoUser = await User.findOne({ email: 'user@toystore.com' });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const userPassword = await bcrypt.hash('UserPassword123!', salt);
      demoUser = await User.create({
        name: 'Aarav Sharma',
        email: 'user@toystore.com',
        password: userPassword,
        role: 'user',
        phone: '+91 9812345678',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
      });
      console.log(' Created Demo user (user@toystore.com)');
    }

    // 2. Create the 10 Categories
    const categoriesData = [
      {
        name: 'Soft Toys',
        description: 'Cuddly, plush, and ultra-soft companions for every age.',
        icon: '🧸',
        color: '#FEE2E2',
        image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Educational Toys',
        description: 'Spark curiosity, STEM learning, and scientific discovery.',
        icon: '🔬',
        color: '#E0E7FF',
        image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Remote Control Toys',
        description: 'High-speed RC cars, drones, and stunt vehicles for action lovers.',
        icon: '🎮',
        color: '#FEF3C7',
        image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Building Blocks',
        description: 'Endless architectural creativity with precision brick sets.',
        icon: '🧱',
        color: '#DCFCE7',
        image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Dolls',
        description: 'Fashion dolls, interactive baby dolls, and dream playhouses.',
        icon: '🎀',
        color: '#FCE7F3',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Cars and Vehicles',
        description: 'Die-cast metal cars, emergency rescue rigs, and train tracks.',
        icon: '🚗',
        color: '#F3E8FF',
        image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Board Games',
        description: 'Fun family board games, strategy games, and party classics.',
        icon: '🎲',
        color: '#FFEDD5',
        image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Baby Toys',
        description: 'Sensory rattles, teethers, and safe soft developmental activity centers.',
        icon: '🍼',
        color: '#CFFAFE',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Outdoor Toys',
        description: 'Water blasters, sports kits, ride-on scooters, and active lawn play.',
        icon: '⚽',
        color: '#CCFBF1',
        image: 'https://res.cloudinary.com/kuaksawn/image/upload/v1794995999/toystore/products/lqhqlgmaxx7wsbsjbg6r.jpg',
      },
      {
        name: 'Puzzle Games',
        description: 'Brain teasers, wooden jigsaw puzzles, and spatial IQ challenges.',
        icon: '🧩',
        color: '#EDE9FE',
        image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
      },
    ];

    let savedCategories = await Category.find({});
    if (savedCategories.length === 0) {
      savedCategories = await Category.insertMany(categoriesData);
      console.log(` Seeded ${savedCategories.length} Categories`);
    }
    const catMap = {};
    savedCategories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    // 3. Create Products across the 10 Categories
    const productsData = [
      // 1. Soft Toys
      {
        name: 'Giant Fluffy Brown Bear (100cm)',
        description: 'Super huggable giant teddy bear crafted with ultra-soft hypoallergenic plush material. Comes with a cute satin bow tie.',
        price: 1499,
        discountPrice: 1199,
        productImages: [
          'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Soft Toys'],
        brand: 'Funskool',
        ageGroup: '0-2 Years',
        stockQuantity: 25,
        rating: 4.8,
        numReviews: 42,
        availabilityStatus: 'In Stock',
        isFeatured: true,
      },
      {
        name: 'Cute Pastel Stuffed Unicorn Plush',
        description: 'Magical plush unicorn with rainbow mane, shimmering horn, and velvety-soft fur. Ideal bedtime companion.',
        price: 899,
        discountPrice: 699,
        productImages: [
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Soft Toys'],
        brand: 'Melissa & Doug',
        ageGroup: '3-5 Years',
        stockQuantity: 18,
        rating: 4.6,
        numReviews: 28,
        availabilityStatus: 'In Stock',
        isFeatured: false,
      },

      // 2. Educational Toys
      {
        name: 'STEM Junior Science Lab Microscope Kit',
        description: 'Real working optical microscope kit with prepared slides, specimen vials, tweezers, and educational exploration guide.',
        price: 2499,
        discountPrice: 1999,
        productImages: [
          'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Educational Toys'],
        brand: 'Fisher-Price',
        ageGroup: '6-8 Years',
        stockQuantity: 14,
        rating: 4.9,
        numReviews: 35,
        availabilityStatus: 'In Stock',
        isFeatured: true,
      },
      {
        name: 'Interactive Solar System Planetarium Model',
        description: 'Motorized revolving solar system model with built-in projector showing planetary surfaces and constellations.',
        price: 1899,
        discountPrice: 1499,
        productImages: [
          'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Educational Toys'],
        brand: 'Funskool',
        ageGroup: '9-12 Years',
        stockQuantity: 20,
        rating: 4.7,
        numReviews: 19,
        availabilityStatus: 'In Stock',
        isFeatured: true,
      },

      // 3. Remote Control Toys
      {
        name: 'High-Speed 4WD Stunt RC Monster Truck',
        description: 'All-terrain 2.4GHz remote control monster truck with shock absorbers, 360-degree spins, and LED headlights.',
        price: 3299,
        discountPrice: 2699,
        productImages: [
          'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Remote Control Toys'],
        brand: 'Hot Wheels',
        ageGroup: '6-8 Years',
        stockQuantity: 12,
        rating: 4.9,
        numReviews: 53,
        availabilityStatus: 'In Stock',
        isFeatured: true,
      },
      {
        name: 'Acrobatic Quadcopter Drone with HD Camera',
        description: 'One-key takeoff drone with altitude hold, 720p HD live video stream, protective propeller guards, and flip stunts.',
        price: 4999,
        discountPrice: 3999,
        productImages: [
          'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Remote Control Toys'],
        brand: 'Hasbro',
        ageGroup: '12+ Years',
        stockQuantity: 8,
        rating: 4.5,
        numReviews: 24,
        availabilityStatus: 'In Stock',
        isFeatured: false,
      },

      // 4. Building Blocks
      {
        name: 'Galactic Spaceship Explorer Brick Set (850 Pcs)',
        description: 'Epic modular space exploration cruiser featuring detachable cockpit, working cargo ramp, astronaut minifigures and planetary rover.',
        price: 3499,
        discountPrice: 2899,
        productImages: [
          'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Building Blocks'],
        brand: 'Lego',
        ageGroup: '9-12 Years',
        stockQuantity: 30,
        rating: 5.0,
        numReviews: 67,
        availabilityStatus: 'In Stock',
        isFeatured: true,
      },
      {
        name: 'Classic Creative Colorful Bricks Box (500 Pcs)',
        description: 'Vibrant assortment of building blocks with wheels, windows, doors, and eye tiles to foster unlimited open-ended imagination.',
        price: 1999,
        discountPrice: 1599,
        productImages: [
          'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Building Blocks'],
        brand: 'Lego',
        ageGroup: '3-5 Years',
        stockQuantity: 40,
        rating: 4.8,
        numReviews: 89,
        availabilityStatus: 'In Stock',
        isFeatured: true,
      },

      // 5. Dolls
      {
        name: 'Princess Royal Ballgown Fashion Doll Set',
        description: 'Articulated fashion doll with glittering gown, tiara, switchable accessories, and dressing mirror wardrobe.',
        price: 1699,
        discountPrice: 1299,
        productImages: [
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Dolls'],
        brand: 'Barbie',
        ageGroup: '3-5 Years',
        stockQuantity: 15,
        rating: 4.7,
        numReviews: 31,
        availabilityStatus: 'In Stock',
        isFeatured: false,
      },

      // 6. Cars and Vehicles
      {
        name: 'Die-Cast 1:24 Racing Supercar Collection (Pack of 5)',
        description: 'Heavy duty die-cast metallic sports cars with free-rolling rubber wheels, opening scissor doors, and sleek racing decals.',
        price: 1599,
        discountPrice: 1249,
        productImages: [
          'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Cars and Vehicles'],
        brand: 'Hot Wheels',
        ageGroup: '3-5 Years',
        stockQuantity: 35,
        rating: 4.9,
        numReviews: 76,
        availabilityStatus: 'In Stock',
        isFeatured: true,
      },

      // 7. Board Games
      {
        name: 'Monopoly Ultimate Banking Modern Edition',
        description: 'Touch technology banking unit replaces cash transactions. Fast-paced family property trading game with exciting modern twist.',
        price: 2199,
        discountPrice: 1799,
        productImages: [
          'https://res.cloudinary.com/kuaksawn/image/upload/v1794995572/toystore/products/clqsh4lfn5rebqq4jvmk.jpg',
          'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Board Games'],
        brand: 'Hasbro',
        ageGroup: '6-8 Years',
        stockQuantity: 22,
        rating: 4.8,
        numReviews: 58,
        availabilityStatus: 'In Stock',
        isFeatured: true,
      },

      // 8. Baby Toys
      {
        name: 'Sensory Musical Activity Cube for Infants',
        description: '6-in-1 learning activity center with piano keys, shape sorter, spinning gears, and soft tactile elements for early motor skills.',
        price: 1399,
        discountPrice: 1099,
        productImages: [
          'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Baby Toys'],
        brand: 'Fisher-Price',
        ageGroup: '0-2 Years',
        stockQuantity: 19,
        rating: 4.9,
        numReviews: 64,
        availabilityStatus: 'In Stock',
        isFeatured: true,
      },

      // 9. Outdoor Toys
      {
        name: 'Super Soaker Dual Blast Water Blaster',
        description: 'High capacity outdoor pump blaster firing dual streams up to 35 feet. Perfect for summer garden play and backyard fun.',
        price: 1199,
        discountPrice: 899,
        productImages: [
          'https://res.cloudinary.com/kuaksawn/image/upload/v1794995999/toystore/products/lqhqlgmaxx7wsbsjbg6r.jpg',
          'https://images.unsplash.com/photo-1533518463841-d62e1fc91373?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Outdoor Toys'],
        brand: 'Nerf',
        ageGroup: '6-8 Years',
        stockQuantity: 28,
        rating: 4.6,
        numReviews: 29,
        availabilityStatus: 'In Stock',
        isFeatured: false,
      },

      // 10. Puzzle Games
      {
        name: 'Wooden 3D Mechanical Gear Clock Puzzle',
        description: 'Laser-cut precision wooden jigsaw mechanical model. Assembles into a real working pendulum clock without glue.',
        price: 2799,
        discountPrice: 2299,
        productImages: [
          'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
        ],
        category: catMap['Puzzle Games'],
        brand: 'Melissa & Doug',
        ageGroup: '12+ Years',
        stockQuantity: 11,
        rating: 4.9,
        numReviews: 38,
        availabilityStatus: 'In Stock',
        isFeatured: true,
      },
    ];

    let savedProducts = await Product.find({});
    if (savedProducts.length === 0) {
      savedProducts = await Product.insertMany(productsData);
      console.log(` Seeded ${savedProducts.length} Products across all 10 categories`);
    }

    // 4. Create Sample Address for Demo User if not exists
    const hasAddress = await Address.findOne({ user: demoUser._id });
    if (!hasAddress) {
      await Address.create({
        user: demoUser._id,
        fullName: 'Aarav Sharma',
        phoneNumber: '+91 9812345678',
        streetAddress: '42, Lotus Boulevard, Sector 100',
        city: 'Noida',
        state: 'Uttar Pradesh',
        postalCode: '201304',
        country: 'India',
        isDefault: true,
      });
      console.log(' Seeded Demo Address');
    }

    // 5. Create Sample Orders ONLY if 0 orders exist in database
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && savedProducts.length > 0) {
      await Order.create([
        {
          user: demoUser._id,
          orderItems: [
            {
              product: savedProducts[0]._id,
              name: savedProducts[0].name,
              image: savedProducts[0].productImages[0],
              price: savedProducts[0].discountPrice,
              quantity: 1,
            },
            {
              product: savedProducts[6]._id,
              name: savedProducts[6].name,
              image: savedProducts[6].productImages[0],
              price: savedProducts[6].discountPrice,
              quantity: 1,
            },
          ],
          shippingAddress: {
            fullName: 'Aarav Sharma',
            phoneNumber: '+91 9812345678',
            streetAddress: '42, Lotus Boulevard, Sector 100',
            city: 'Noida',
            state: 'Uttar Pradesh',
            postalCode: '201304',
            country: 'India',
          },
          paymentMethod: 'Razorpay',
          paymentResult: {
            id: 'pay_demo_1001',
            status: 'COMPLETED',
            razorpay_order_id: 'order_demo_1001',
            razorpay_payment_id: 'pay_demo_1001',
          },
          itemsPrice: 4098,
          shippingPrice: 0,
          taxPrice: 205,
          totalPrice: 4303,
          isPaid: true,
          paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          orderStatus: 'Delivered',
          deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          user: demoUser._id,
          orderItems: [
            {
              product: savedProducts[2]._id,
              name: savedProducts[2].name,
              image: savedProducts[2].productImages[0],
              price: savedProducts[2].discountPrice,
              quantity: 1,
            },
          ],
          shippingAddress: {
            fullName: 'Aarav Sharma',
            phoneNumber: '+91 9812345678',
            streetAddress: '42, Lotus Boulevard, Sector 100',
            city: 'Noida',
            state: 'Uttar Pradesh',
            postalCode: '201304',
            country: 'India',
          },
          paymentMethod: 'Razorpay',
          paymentResult: {
            id: 'pay_demo_1002',
            status: 'COMPLETED',
            razorpay_order_id: 'order_demo_1002',
            razorpay_payment_id: 'pay_demo_1002',
          },
          itemsPrice: 1999,
          shippingPrice: 0,
          taxPrice: 100,
          totalPrice: 2099,
          isPaid: true,
          paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          orderStatus: 'Shipped',
        },
      ]);
      console.log(' Seeded initial demo orders');
    } else {
      console.log(` Preserving all existing customer orders (${orderCount} orders in database)`);
    }

    // 6. Create Sample Reviews ONLY if 0 reviews exist
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0 && savedProducts.length > 0) {
      await Review.create([
        {
          user: demoUser._id,
          product: savedProducts[0]._id,
          rating: 5,
          title: 'Adorable & Super Soft!',
          comment: 'My niece absolutely loved this giant bear! Stitching is high quality and fur is so fluffy.',
        },
        {
          user: demoUser._id,
          product: savedProducts[6]._id,
          rating: 5,
          title: 'Outstanding Lego set!',
          comment: 'The details on the spaceship are incredible. Kept my 10-year-old engaged for hours.',
        },
      ]);
      console.log(' Seeded initial reviews');
    }

    console.log(' Database catalogue check completed successfully!');
    return true;
  } catch (error) {
    console.error(' Error seeding database:', error);
    throw error;
  }
};

// If run directly via node utils/seedData.js
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  (async () => {
    await connectDB();
    const force = process.argv.includes('--force');
    await seedDatabase({ force });
    process.exit(0);
  })();
}
