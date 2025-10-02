import React, { useState, useEffect } from 'react';
import { 
  ArrowRight,
  Play,
  Star,
  ChevronDown
} from 'lucide-react';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Dashboard from '../components/layout/Dashboard';

const Home = () => {
  const [mounted, setMounted] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: "⚡",
      title: "Fast & Reliable",
      description: "Lightning-fast performance with 99.9% uptime guarantee"
    },
    {
      icon: "🔒",
      title: "Secure",
      description: "Enterprise-grade security protecting your data"
    },
    {
      icon: "📱",
      title: "Mobile First",
      description: "Optimized for all devices and screen sizes"
    },
    {
      icon: "🌍",
      title: "Global Reach",
      description: "Worldwide CDN for fast delivery everywhere"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart",
      content: "This platform transformed our business operations. The results exceeded our expectations!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "CTO, InnovateCorp",
      content: "Incredible performance and reliability. Our team productivity increased significantly.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Founder, GrowthLab",
      content: "The best investment we've made. Simple, powerful, and exactly what we needed.",
      rating: 5
    }
  ];

  const stats = [
    { number: "10K+", label: "Customers" },
    { number: "99.9%", label: "Uptime" },
    { number: "50+", label: "Countries" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <ProtectedRoute>
      <Dashboard>
        <div className="min-h-screen bg-white">

          {/* Hero Section */}
          <section className="py-20 lg:py-24">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900">
                  Build Amazing
                  <br />
                  <span className="text-blue-600">Digital Experiences</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Empower your business with our cutting-edge platform. Create, scale, and optimize your digital presence.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <span>Start Free Trial</span>
                    <ArrowRight size={18} />
                  </button>
                  
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Play size={16} className="ml-0.5" />
                    </div>
                    <span className="font-medium">Watch Demo</span>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto">
                  {stats.map((stat, index) => (
                    <div 
                      key={stat.label}
                      className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                      style={{ transitionDelay: `${index * 150}ms` }}
                    >
                      <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                        {stat.number}
                      </div>
                      <div className="text-gray-500 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  Why Choose Us?
                </h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                  Powerful features designed to help your business thrive
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={feature.title}
                    className={`bg-white p-6 rounded-lg border border-gray-200 transition-all duration-500 ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    } hover:shadow-md`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <div className="text-2xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 bg-blue-600">
            <div className="max-w-3xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold mb-12 text-white">
                Loved by Thousands
              </h2>

              <div className="relative">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index}
                    className={`transition-all duration-500 ${
                      index === currentTestimonial ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute inset-0'
                    }`}
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="text-yellow-400 fill-current" size={20} />
                        ))}
                      </div>
                      
                      <blockquote className="text-lg text-white mb-6 leading-relaxed">
                        "{testimonial.content}"
                      </blockquote>
                      
                      <div className="text-white">
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-blue-100 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Testimonial Indicators */}
                <div className="flex justify-center space-x-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentTestimonial ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-gray-900">
            <div className="max-w-2xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold mb-4 text-white">
                Ready to get started?
              </h2>
              <p className="text-gray-400 mb-8">
                Join thousands of satisfied customers today
              </p>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Start Free Trial
              </button>
            </div>
          </section>

        </div>
      </Dashboard>
    </ProtectedRoute>
  );
};

export default Home;