import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Total sales calculation (from paid orders or completed orders)
    const paidOrders = await Order.find({
      $or: [{ isPaid: true }, { orderStatus: 'Delivered' }],
    });
    const totalSales = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);

    // Order status breakdown
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

    // Low stock products (< 5)
    const lowStockProducts = await Product.find({ stockQuantity: { $lte: 5 } })
      .populate('category', 'name')
      .limit(6);

    // Recent 5 orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 reviews
    const recentReviews = await Review.find({})
      .populate('user', 'name avatar')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales,
      statusCounts: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      lowStockProducts,
      recentOrders,
      recentReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get Sales Reports & Analytics
// @route   GET /api/admin/sales-reports
// @access  Private/Admin
export const getSalesReports = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: { $ne: 'Cancelled' } }).sort({ createdAt: 1 });

    // Monthly revenue aggregation
    const monthlySalesMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize with recent 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlySalesMap[key] = { month: key, revenue: 0, ordersCount: 0 };
    }

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlySalesMap[key]) {
        monthlySalesMap[key].revenue += order.totalPrice;
        monthlySalesMap[key].ordersCount += 1;
      }
    });

    // Top selling toys
    const productSalesMap = {};
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const pId = item.product.toString();
        if (!productSalesMap[pId]) {
          productSalesMap[pId] = {
            productId: pId,
            name: item.name,
            image: item.image,
            unitsSold: 0,
            revenue: 0,
          };
        }
        productSalesMap[pId].unitsSold += item.quantity;
        productSalesMap[pId].revenue += item.price * item.quantity;
      });
    });

    const topSellingToys = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // Sales by category
    const categories = await Category.find({});
    const categorySales = await Promise.all(
      categories.map(async (cat) => {
        const catProducts = await Product.find({ category: cat._id }).select('_id');
        const prodIds = catProducts.map((p) => p._id.toString());

        let categoryRevenue = 0;
        let units = 0;

        orders.forEach((order) => {
          order.orderItems.forEach((item) => {
            if (prodIds.includes(item.product.toString())) {
              categoryRevenue += item.price * item.quantity;
              units += item.quantity;
            }
          });
        });

        return {
          name: cat.name,
          color: cat.color || '#FEE2E2',
          revenue: categoryRevenue,
          unitsSold: units,
        };
      })
    );

    res.json({
      monthlySales: Object.values(monthlySalesMap),
      topSellingToys,
      categorySales: categorySales.sort((a, b) => b.revenue - a.revenue),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

