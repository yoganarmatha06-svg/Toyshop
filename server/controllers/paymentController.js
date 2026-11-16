import Razorpay from 'razorpay';
import crypto from 'crypto';

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret && key_id !== 'your_razorpay_key_id') {
    return new Razorpay({ key_id, key_secret });
  }
  return null;
};

// @desc    Get Razorpay public key
// @route   GET /api/payment/key
// @access  Public
export const getRazorpayKey = (req, res) => {
  res.json({
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_toyShopDemoKey123',
    isTestMode: true,
  });
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const instance = getRazorpayInstance();
    const amountInPaise = Math.round(Number(amount) * 100);

    if (instance) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt || `receipt_order_${Date.now()}`,
      };

      const order = await instance.orders.create(options);
      return res.json(order);
    } else {
      // Test/Demo mode simulation when live credentials are not configured
      const mockOrderId = `order_demo_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      return res.json({
        id: mockOrderId,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000),
        isSimulation: true,
      });
    }
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: error.message || 'Error creating payment order' });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ message: 'Missing payment parameters' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // If using real keys and signature is provided
    if (key_secret && key_secret !== 'your_razorpay_key_secret' && razorpay_signature) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        return res.json({
          success: true,
          message: 'Payment verified successfully',
          paymentId: razorpay_payment_id,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature. Verification failed.',
        });
      }
    } else {
      // In test/demo mode simulation
      return res.json({
        success: true,
        message: 'Test payment verified successfully',
        paymentId: razorpay_payment_id || `pay_test_${Date.now()}`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Payment verification error' });
  }
};

