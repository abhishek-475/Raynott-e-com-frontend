import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcAmex,
  FaApplePay,
  FaGooglePay,
  FaShieldAlt,
  FaTruck,
  FaHeadphones,
  FaEnvelope
} from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Shop": [
      { name: "All Products", path: "/products" },
      { name: "New Arrivals", path: "/new-arrivals" },
      { name: "Best Sellers", path: "/best-sellers" },
      { name: "Deals", path: "/deals" }
    ],
    "Help": [
      { name: "Help Center", path: "/help" },
      { name: "Track Order", path: "/track-order" },
      { name: "Returns", path: "/returns" },
      { name: "Shipping", path: "/shipping" }
    ],
    "Company": [
      { name: "About Us", path: "/about" },
      { name: "Careers", path: "/careers" },
      { name: "Contact", path: "/contact" },
      { name: "Privacy", path: "/privacy" }
    ]
  };

  const socialMedia = [
    { icon: <FaFacebook />, name: "Facebook" },
    { icon: <FaTwitter />, name: "Twitter" },
    { icon: <FaInstagram />, name: "Instagram" },
    { icon: <FaYoutube />, name: "YouTube" }
  ];

  const paymentMethods = [
    { icon: <FaCcVisa />, name: "Visa" },
    { icon: <FaCcMastercard />, name: "Mastercard" },
    { icon: <FaCcPaypal />, name: "PayPal" },
    { icon: <FaCcAmex />, name: "Amex" },
    { icon: <FaApplePay />, name: "Apple Pay" },
    { icon: <FaGooglePay />, name: "Google Pay" }
  ];

  const features = [
    { icon: <FaTruck />, text: "Free Shipping" },
    { icon: <FaShieldAlt />, text: "Secure" },
    { icon: <FaHeadphones />, text: "24/7 Support" }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Features Bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="text-blue-400">
                  {feature.icon}
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded">
                <div className="h-5 w-5 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-bold text-white">Raynott</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Premium shopping experience with curated collections.
            </p>
            
            {/* Newsletter */}
            <div className="mb-4">
              <p className="text-sm font-medium text-white mb-2">Stay Updated</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                  <FaEnvelope className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Social */}
            <div>
              <p className="text-sm font-medium text-white mb-2">Follow Us</p>
              <div className="flex gap-3">
                {socialMedia.map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Payment Methods */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Payment Methods</p>
              <div className="flex gap-2">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-800 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    title={method.name}
                  >
                    {method.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                &copy; {currentYear} Raynott E-Commerce
              </p>
              <div className="flex gap-4 mt-2 justify-center md:justify-end">
                <Link to="/privacy" className="text-xs text-gray-500 hover:text-gray-300">
                  Privacy
                </Link>
                <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-300">
                  Terms
                </Link>
                <Link to="/contact" className="text-xs text-gray-500 hover:text-gray-300">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="bg-gray-950 py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
            <FaShieldAlt className="h-3 w-3 text-green-500" />
            <span>Secure & Trusted Shopping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}