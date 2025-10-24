'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { ArrowLeft, Mail, MessageSquare, User, Send, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import Navbar from '@/components/landing/navbar';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function Contact() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Email is invalid';
    }
    if (!formData.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when user starts typing
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        console.log('Form submitted:', formData);
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        setErrors({});
        setIsSubmitting(false);
        
        // Hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      }, 1500);
    } else {
      setErrors(validationErrors);
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E2FEE4] via-white to-[#E2FEE4]">
      {/* Header */}
      <Navbar/>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Introduction */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 border border-[#E2FEE4]/50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-12 h-12 bg-[#E2FEE4] rounded-full flex items-center justify-center flex-shrink-0 self-start">
              <Mail className="w-6 h-6 text-[#03E525]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Get in Touch</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For quick support or inquiries, please email us directly at{' '}
                <a
                  href="mailto:support@zeevo.com"
                  className="text-[#03E525] hover:text-[#02CE21] underline font-medium"
                >
                  support@zeevo.shop
                </a>
              </p>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#03E525] text-white rounded-lg hover:bg-[#02CE21] transition-colors font-medium shadow-md hover:shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                {showForm ? 'Hide Contact Form' : 'Or send us a message'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-[#E2FEE4] border border-[#03E525]/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#03E525] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#03E525]/90 font-medium">Message sent successfully!</p>
              <p className="text-[#03E525]/70 text-sm mt-1">Thanks for reaching out! We'll get back to you soon.</p>
            </div>
          </div>
        )}

        {/* Contact Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-[#E2FEE4]/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#E2FEE4] rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#03E525]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Send us a message</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  We'll respond within 24 hours
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-[#E2FEE4]/50 focus:ring-[#03E525] focus:border-[#03E525]'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-[#E2FEE4]/50 focus:ring-[#03E525] focus:border-[#03E525]'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 resize-none ${
                    errors.message 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-[#E2FEE4]/50 focus:ring-[#03E525] focus:border-[#03E525]'
                  }`}
                  placeholder="Tell us how we can help you..."
                />
                {errors.message && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.message}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#03E525] hover:bg-[#02CE21]'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t border-[#E2FEE4]/50">
          <p className="text-sm text-gray-500">
            © 2025 Zeevo. We typically respond to messages within 24 hours.
          </p>
        </div>
      </main>
    </div>
  );
}