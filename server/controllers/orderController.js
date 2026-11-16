import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

// @desc    Create new order (with server-side price & stock validation)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, paymentResult, isPaid } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shippingAddress || !shippingAddress.streetAddress || !shippingAddress.city) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Server-side validation of products, prices and stock
    const verifiedOrderItems = [];
    let calculatedItemsPrice = 0;

    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product);

      if (!dbProduct) {
        return res.status(404).json({ message: `Product not found: ${item.name || item.product}` });
      }

      if (dbProduct.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stockQuantity} remaining.`,
        });
      }

      // Live price check
      const verifiedPrice =
        dbProduct.discountPrice > 0 ? dbProduct.discountPrice : dbProduct.price;

      verifiedOrderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        image: dbProduct.productImages[0] || item.image,
        price: verifiedPrice,
        quantity: item.quantity,
      });

      calculatedItemsPrice += verifiedPrice * item.quantity;
    }

    // Shipping & Tax calculation
    const shippingPrice = calculatedItemsPrice >= 999 ? 0 : 99;
    const taxPrice = Math.round(calculatedItemsPrice * 0.05); // 5% GST
    const totalPrice = calculatedItemsPrice + shippingPrice + taxPrice;

    // Deduct stock quantity for purchased items
    for (const item of verifiedOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity },
      });
      // Check if stock became 0
      const updatedP = await Product.findById(item.product);
      if (updatedP && updatedP.stockQuantity <= 0) {
        updatedP.availabilityStatus = 'Out of Stock';
        await updatedP.save();
      }
    }

    const order = new Order({
      user: req.user._id,
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Razorpay',
      paymentResult: paymentResult || {},
      itemsPrice: calculatedItemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: Boolean(isPaid),
      paidAt: isPaid ? Date.now() : null,
      orderStatus: 'Pending',
    });

    const savedOrder = await order.save();

    // Clear cart upon order creation
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error creating order' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name productImages brand');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorize: owner or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id || req.body.razorpay_payment_id,
      status: req.body.status || 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: req.body.email || req.user.email,
      razorpay_order_id: req.body.razorpay_order_id,
      razorpay_payment_id: req.body.razorpay_payment_id,
      razorpay_signature: req.body.razorpay_signature,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    const status = req.query.status;

    const query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      totalOrders: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Choose from: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

