import React from 'react';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Lightning Fast Store Creation",
      description: "Build and launch your online store in under 5 minutes with no technical skills needed."
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Beautiful Store Templates",
      description: "Choose from stunning, customizable templates that perfectly reflect your unique brand identity."
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Secure & Reliable Hosting",
      description: "Enterprise-grade security and hosting with 99.9% uptime guarantee for your peace of mind."
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Built-in Analytics & Tools",
      description: "Track performance and grow your store with integrated analytics and marketing tools."
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Complete E-commerce Features",
      description: "Everything you need - from payment processing to inventory management and customer support."
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Global Ready",
      description: "Multi-currency support, global payment processing, and worldwide content delivery."
    }
  ];

  return (
    <section className="pb-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">
            Everything You Need to Build & Grow Your Store
          </h2>
          <p className="mt-4 max-sm:text-sm text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful creation tools and features to build, launch, and scale your online store effortlessly.
          </p>

          {/* Decorative Divider */}
          <div className="flex items-center mt-8">
            <div className="flex-1 h-[1px] bg-[#41FB4E]"></div>
            <div className="bg-[#41FB4E] w-10 h-5 rounded-full mx-2"></div>
            <div className="flex-1 h-[1px] bg-[#41FB4E]"></div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-3xl border-[1px] border-[#41FB4E]/40 duration-300 group overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className="p-8 pb-0">
                <div className="bg-[#03E525] mb-3 text-white rounded-lg p-3 w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed mb-8">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
