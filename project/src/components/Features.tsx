import React from 'react';
import { Link, Clock, Shield, BarChart2, Zap, Globe } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Link className="h-6 w-6 text-indigo-600" />,
      title: 'Custom URLs',
      description: 'Create branded, memorable links that reflect your identity or campaign.'
    },
    {
      icon: <Clock className="h-6 w-6 text-indigo-600" />,
      title: 'Expiration Control',
      description: 'Set expiration dates for temporary promotions or time-sensitive content.'
    },
    {
      icon: <Shield className="h-6 w-6 text-indigo-600" />,
      title: 'Link Security',
      description: 'Built-in protection against malicious links and phishing attempts.'
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-indigo-600" />,
      title: 'Detailed Analytics',
      description: 'Track clicks, referrers, geographic data, and device information.'
    },
    {
      icon: <Zap className="h-6 w-6 text-indigo-600" />,
      title: 'Fast Redirection',
      description: 'Lightning-fast redirects ensure a seamless experience for your users.'
    },
    {
      icon: <Globe className="h-6 w-6 text-indigo-600" />,
      title: 'API Access',
      description: 'Integrate URL shortening into your applications with our robust API.'
    }
  ];

  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Powerful Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            LinkShrink offers everything you need to create, manage, and analyze your shortened URLs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;