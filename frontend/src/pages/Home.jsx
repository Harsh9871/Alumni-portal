import React, { useState, useEffect } from 'react';
import { 
  ArrowRight,
  Play,
  Star,
  Users,
  Zap,
  Shield,
  Rocket,
  CheckCircle,
  Globe,
  Smartphone,
  Code,
  Heart,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Dashboard from '../components/layout/Dashboard';

const Home = () => {
  const [mounted, setMounted] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built with performance in mind. Experience blazing fast load times and smooth interactions.",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee. Your data is always protected.",
      gradient: "from-green-400 to-blue-500"
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Perfectly optimized for all devices. Native mobile experience on every screen size.",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: Globe,
      title: "Global Scale",
      description: "Worldwide CDN network ensures fast delivery no matter where your users are located.",
      gradient: "from-blue-400 to-indigo-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart",
      content: "This platform transformed our business operations. The results exceeded our expectations!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "CTO, InnovateCorp",
      content: "Incredible performance and reliability. Our team productivity increased by 300%.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Founder, GrowthLab",
      content: "The best investment we've made. Simple, powerful, and exactly what we needed.",
      rating: 5,
      avatar: "ER"
    }
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "99.9%", label: "Uptime" },
    { number: "50+", label: "Countries" },
    { number: "24/7", label: "Support" }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small teams getting started",
      features: ["Up to 5 users", "10GB storage", "Email support", "Basic analytics"],
      popular: false,
      gradient: "from-gray-600 to-gray-800"
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Most popular choice for growing businesses",
      features: ["Up to 25 users", "100GB storage", "Priority support", "Advanced analytics", "API access"],
      popular: true,
      gradient: "from-blue-500 to-purple-600"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Tailored solution for large organizations",
      features: ["Unlimited users", "Unlimited storage", "24/7 phone support", "Custom integrations", "Dedicated manager"],
      popular: false,
      gradient: "from-purple-600 to-pink-600"
    }
  ];

  return (
    <ProtectedRoute>
      <Dashboard>
        <div className="min-h-screen bg-white overflow-hidden">

          {/* Hero Section */}
          <section className="relative py-20 lg:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
            <div className="absolute inset-0">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
              <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <h1 className="text-5xl lg:text-7xl font-bold mb-8">
                  <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Build Amazing
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Digital Experiences
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Empower your business with our cutting-edge platform. Create, scale, and optimize your digital presence with tools that actually work.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                  <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                    <span>Start Free Trial</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </button>
                  
                  <button className="group flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Play size={16} className="ml-1" />
                    </div>
                    <span className="text-lg font-medium">Watch Demo</span>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                  {stats.map((stat, index) => (
                    <div 
                      key={stat.label}
                      className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                      style={{ transitionDelay: `${index * 200}ms` }}
                    >
                      <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {stat.number}
                      </div>
                      <div className="text-gray-600 font-medium mt-2">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Why Choose Us?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  We've built the perfect combination of powerful features and intuitive design to help your business thrive.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {features.map((feature, index) => (
                  <div 
                    key={feature.title}
                    className={`group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="text-white" size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-900 to-purple-900">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
              <h2 className="text-4xl lg:text-5xl font-bold mb-16 text-white">
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
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 lg:p-12">
                      <div className="flex justify-center mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="text-yellow-400 fill-current" size={24} />
                        ))}
                      </div>
                      
                      <blockquote className="text-xl lg:text-2xl text-white mb-8 leading-relaxed">
                        "{testimonial.content}"
                      </blockquote>
                      
                      <div className="flex items-center justify-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                          {testimonial.avatar}
                        </div>
                        <div className="text-left">
                          <div className="text-white font-semibold">{testimonial.name}</div>
                          <div className="text-blue-200">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Testimonial Indicators */}
                <div className="flex justify-center space-x-2 mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentTestimonial ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Rocket className="text-white" size={16} />
                  </div>
                  <span className="text-xl font-bold">YourApp</span>
                </div>
                
                <div className="flex items-center space-x-6 text-gray-400">
                  <span>© 2025 YourApp. All rights reserved.</span>
                  <Heart className="text-red-500" size={16} />
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Dashboard>
    </ProtectedRoute>
  );
};

export default Home;