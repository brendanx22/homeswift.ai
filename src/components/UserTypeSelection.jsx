import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building, Users, ArrowRight } from 'lucide-react';

const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleUserTypeSelect = (userType) => {
    if (userType === 'renter') {
      navigate('/login');
    } else if (userType === 'landlord') {
      navigate('/list-login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Choose Your Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Whether you're looking to find your perfect home or list properties for others, we're here to help.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Landlord/Property Lister Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
            onClick={() => handleUserTypeSelect('landlord')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <Building className="w-10 h-10 text-orange-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Property Owner/Manager</h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                List your properties, manage bookings, track inquiries, and grow your rental business with our comprehensive dashboard.
              </p>

              <div className="space-y-3 mb-8 w-full">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Professional property management tools</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Real-time booking and inquiry management</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Advanced analytics and reporting</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Multi-property management</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-orange-600 font-semibold">
                <span>Get Started as a Landlord</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          {/* Renter/Buyer Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
            onClick={() => handleUserTypeSelect('renter')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-blue-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm Looking for a Home</h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Discover your perfect home with our curated listings, virtual tours, and personalized recommendations.
              </p>

              <div className="space-y-3 mb-8 w-full">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Thousands of verified listings</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Virtual tours and 360° views</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Advanced search filters</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Save favorites and get alerts</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-blue-600 font-semibold">
                <span>Start Browsing Homes</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12"
        >
          <p className="text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Sign in here
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserTypeSelection;
