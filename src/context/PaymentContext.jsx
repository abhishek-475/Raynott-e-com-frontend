import { createContext, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { createPaymentOrder, verifyPayment, createCODOrder } from '../services/paymentService';
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
        console.log('Razorpay already loaded');
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        if (window.Razorpay) {
          resolve(true);
        } else {
          console.error('Razorpay object not found after script load');
          resolve(false);
        }
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Razorpay script:', error);
        toast.error('Failed to load payment gateway. Please refresh the page.');
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  };

  // Create Razorpay order
  const createRazorpayOrder = async (orderData) => {
    try {
      setPaymentLoading(true);
      console.log('Creating Razorpay order:', orderData);
      
      // Validate amount
      if (!orderData.amount || orderData.amount < 1) {
        throw new Error('Invalid amount. Minimum amount is ₹1.');
      }
      
      const response = await createPaymentOrder(orderData);
      console.log('Razorpay order created:', response);
      
      setOrderId(response.id);
      return response;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      toast.error(error.message || 'Failed to create payment order. Please try again.');
      throw error;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Verify payment
  const verifyRazorpayPayment = async (paymentData) => {
    try {
      setPaymentLoading(true);
      console.log('Verifying payment:', paymentData);
      
      const response = await verifyPayment(paymentData);
      console.log('Payment verification response:', response);
      
      if (response.success || response.message?.includes('success')) {
        toast.success('Payment verified successfully!');
        return response;
      } else {
        throw new Error(response.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error(error.message || 'Payment verification failed. Please contact support.');
      throw error;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Process Razorpay payment
  const processRazorpayPayment = async (orderDetails, userDetails, onSuccess) => {
    try {
      console.log('Starting Razorpay payment process...');
      
      // Validate order details
      if (!orderDetails || !userDetails) {
        toast.error('Invalid order details');
        return false;
      }

      // Load Razorpay script if not already loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please refresh the page and try again.');
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
        toast.error('Payment gateway configuration error. Please contact support.');
        console.error('Razorpay key not found in environment variables');
        return false;
      }

      console.log('Opening Razorpay checkout...');

      // Razorpay options
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'Raynott E-Com',
        description: `Order #${order.receipt}`,
        order_id: order.id,
        handler: async function(response) {
          try {
            console.log('Payment successful, verifying...', response);
            
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
                orderId: verificationResult.data?.orderId || verificationResult.orderId,
                orderNumber: verificationResult.data?.orderNumber || order.receipt,
                payment_method: 'razorpay'
              });
            }

            toast.success('Payment successful! Order confirmed.');
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support with your payment ID.');
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
            toast.info('Payment cancelled. You can try again.');
          }
        }
      };

      // Open Razorpay checkout
      const razorpayInstance = new window.Razorpay(options);
      
      // Handle payment failures
      razorpayInstance.on('payment.failed', function(response) {
        console.error('Payment failed:', response);
        const errorMsg = response.error ? 
          `Payment failed: ${response.error.description}` : 
          'Payment failed. Please try again or contact support.';
        toast.error(errorMsg);
      });
      
      razorpayInstance.open();

      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Failed to process payment. Please try again.');
      return false;
    }
  };

  // Process COD order - AVAILABLE FOR ALL ORDERS
  const processCODOrder = async (orderDetails, userDetails, onSuccess) => {
    try {
      setPaymentLoading(true);
      console.log('Processing COD order:', orderDetails);
      
      // Call the actual COD API endpoint
      const response = await createCODOrder({
        orderDetails: {
          items: orderDetails.items.map(item => ({
            productId: item.id || item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image
          })),
          subtotal: orderDetails.subtotal || cartTotal,
          shipping: orderDetails.shipping || 0,
          tax: orderDetails.tax || 0,
          grandTotal: orderDetails.totalAmount
        },
        shippingAddress: userDetails
      });
      
      console.log('COD order response:', response);
      
      // Clear cart for COD
      clearCart();
      
      if (onSuccess) {
        onSuccess({
          payment_method: 'cod',
          order_id: response.orderId || response.data?.orderId || `COD_${Date.now()}`,
          orderNumber: response.orderNumber || response.data?.orderNumber || `COD_${Date.now()}`,
          status: 'confirmed'
        });
      }
      
      toast.success('Cash on Delivery order confirmed! You will pay ₹' + orderDetails.totalAmount + ' when you receive your order.');
      return true;
    } catch (error) {
      console.error('COD processing error:', error);
      toast.error(error.message || 'Failed to place COD order. Please try again.');
      return false;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Main payment processor - COD AVAILABLE FOR ALL ORDERS
  const processPayment = async (orderDetails, userDetails, onSuccess) => {
    // COD is now available for ALL orders - no amount restriction
    if (paymentMethod === 'razorpay') {
      return await processRazorpayPayment(orderDetails, userDetails, onSuccess);
    } else if (paymentMethod === 'cod') {
      return await processCODOrder(orderDetails, userDetails, onSuccess);
    }
    
    toast.error('Invalid payment method selected');
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