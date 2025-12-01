import { createContext, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { createPaymentOrder, verifyPayment, createCODOrder } from '../services/paymentService'; // Add createCODOrder
import { CartContext } from './CartContext';

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'

  // Initialize Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        if (window.Razorpay) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Create Razorpay order
  const createRazorpayOrder = async (orderData) => {
    try {
      setPaymentLoading(true);
      const response = await createPaymentOrder(orderData);
      setOrderId(response.id);
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to create payment order');
      throw error;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Verify payment
  const verifyRazorpayPayment = async (paymentData) => {
    try {
      setPaymentLoading(true);
      const response = await verifyPayment(paymentData);
      toast.success('Payment verified successfully!');
      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error(error.message || 'Payment verification failed');
      throw error;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Process Razorpay payment
  const processRazorpayPayment = async (orderDetails, userDetails, onSuccess) => {
    try {
      // Load Razorpay script if not already loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return false;
      }

      // Create order on backend
      const order = await createRazorpayOrder({
        amount: orderDetails.totalAmount,
        currency: 'INR',
        receipt: `order_${Date.now()}`
      });

      // Get Razorpay key from environment variables
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        toast.error('Payment gateway configuration error');
        return false;
      }

      // Razorpay options
      const options = {
        key: razorpayKey, // Use import.meta.env instead of process.env
        amount: order.amount,
        currency: order.currency,
        name: 'Raynott E-Com',
        description: `Order #${order.receipt}`,
        order_id: order.id,
        handler: async function(response) {
          try {
            // Verify payment on backend
            const verificationResult = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: orderDetails,
              shippingAddress: userDetails
            });

            // Clear cart after successful payment
            clearCart();

            // Call success callback
            if (onSuccess) {
              onSuccess({
                ...response,
                orderId: verificationResult.data?.orderId,
                orderNumber: verificationResult.data?.orderNumber
              });
            }

            toast.success('Payment successful! Order confirmed.');
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone || ''
        },
        notes: {
          address: userDetails.street,
          city: userDetails.city,
          state: userDetails.state,
          pincode: userDetails.pincode,
          order_id: order.receipt
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled');
          }
        }
      };

      // Open Razorpay checkout
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function(response) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      
      razorpayInstance.open();

      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Failed to process payment');
      return false;
    }
  };

  // Process COD order
  const processCODOrder = async (orderDetails, userDetails, onSuccess) => {
    try {
      setPaymentLoading(true);
      
      // Call the actual COD API endpoint
      const response = await createCODOrder({
        orderDetails: {
          items: orderDetails.items.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          subtotal: orderDetails.subtotal,
          shipping: orderDetails.shipping || 0,
          tax: orderDetails.tax || 0,
          grandTotal: orderDetails.totalAmount
        },
        shippingAddress: userDetails
      });
      
      // Clear cart for COD
      clearCart();
      
      if (onSuccess) {
        onSuccess({
          payment_method: 'cod',
          order_id: response.orderId || `COD_${Date.now()}`,
          orderNumber: response.orderNumber,
          status: 'confirmed'
        });
      }
      
      toast.success('Cash on Delivery order confirmed!');
      return true;
    } catch (error) {
      console.error('COD processing error:', error);
      toast.error(error.message || 'Failed to place COD order');
      return false;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Main payment processor
  const processPayment = async (orderDetails, userDetails, onSuccess) => {
    // Validate COD eligibility
    if (paymentMethod === 'cod' && orderDetails.subtotal > 10000) {
      toast.error('COD not available for orders above ₹10,000');
      return false;
    }

    if (paymentMethod === 'razorpay') {
      return await processRazorpayPayment(orderDetails, userDetails, onSuccess);
    } else if (paymentMethod === 'cod') {
      return await processCODOrder(orderDetails, userDetails, onSuccess);
    }
    return false;
  };

  return (
    <PaymentContext.Provider value={{
      paymentLoading,
      paymentMethod,
      setPaymentMethod,
      processPayment,
      processRazorpayPayment,
      processCODOrder,
      createRazorpayOrder,
      verifyRazorpayPayment,
      orderId
    }}>
      {children}
    </PaymentContext.Provider>
  );
};