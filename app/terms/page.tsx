'use client'
import React from 'react';
import { ArrowLeft, Calendar, Shield, FileText, Users, CreditCard, AlertTriangle, Scale, Mail, MapPin } from 'lucide-react';

export default function Terms() {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: Shield,
      content: `By using Zeevo's Services, you confirm that you are at least 18 years old or have the legal capacity to enter into this agreement. You agree to comply with these Terms and all applicable laws and regulations.`
    },
    {
      id: 'services',
      title: '2. Description of Services',
      icon: FileText,
      content: `Zeevo provides a platform that allows users to create, customize, and manage online stores/websites through drag-and-drop and other user-friendly tools. We may add, modify, or remove features at our discretion.`
    },
    {
      id: 'account',
      title: '3. Account Registration and Security',
      icon: Users,
      content: [
        'You must create an account to use Zeevo\'s Services.',
        'You are responsible for maintaining the confidentiality of your login credentials.',
        'You agree to notify us immediately of any unauthorized use of your account.',
        'You are responsible for all activities that occur under your account.'
      ]
    },
    {
      id: 'content',
      title: '4. User Content',
      icon: FileText,
      content: [
        'You retain ownership of content you upload or create on Zeevo.',
        'By uploading content, you grant Zeevo a non-exclusive, worldwide license to use, display, and distribute your content as necessary to provide the Service.',
        'You agree not to upload content that is illegal, infringing, offensive, or violates third-party rights.'
      ]
    },
    {
      id: 'payment',
      title: '5. Payment and Subscription',
      icon: CreditCard,
      content: [
        'Certain features or plans may require payment.',
        'You agree to pay all fees according to the pricing and payment terms displayed.',
        'Payments are non-refundable unless otherwise specified.',
        'Zeevo reserves the right to change pricing with advance notice.'
      ]
    },
    {
      id: 'prohibited',
      title: '6. Prohibited Uses',
      icon: AlertTriangle,
      content: [
        'Use the Services for any unlawful or harmful purpose.',
        'Attempt to interfere with or disrupt the Service or servers.',
        'Use automated tools to scrape or collect data.',
        'Impersonate others or misrepresent your affiliation.'
      ],
      isProhibited: true
    },
    {
      id: 'termination',
      title: '7. Termination',
      icon: AlertTriangle,
      content: `We may suspend or terminate your account at any time for violating these Terms. Upon termination, your access to the Services will be revoked. Certain provisions of these Terms will survive termination.`
    },
    {
      id: 'liability',
      title: '8. Disclaimers and Limitation of Liability',
      icon: Shield,
      content: `Zeevo provides the Services "as is" and does not guarantee uninterrupted or error-free service. We disclaim all warranties, express or implied. Zeevo is not liable for any indirect, incidental, or consequential damages arising from your use of the Service.`
    },
    {
      id: 'indemnification',
      title: '9. Indemnification',
      icon: Scale,
      content: `You agree to indemnify and hold harmless Zeevo, its affiliates, and employees from any claims, damages, or expenses arising from your violation of these Terms or misuse of the Service.`
    },
    {
      id: 'changes',
      title: '10. Changes to Terms',
      icon: FileText,
      content: `Zeevo may update these Terms from time to time. We will notify you of significant changes via email or on the website. Continued use of the Service after changes means you accept the updated Terms.`
    },
    {
      id: 'law',
      title: '11. Governing Law',
      icon: Scale,
      content: `These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to conflict of law principles.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </button>
            <div className="flex-1 text-center sm:text-right ml-4">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Terms & Conditions</h1>
              <div className="hidden sm:flex sm:items-center sm:justify-end gap-2 text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: January 2025</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Introduction */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200/50 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Welcome to Zeevo</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms and Conditions ("Terms") govern your use of our website, products, and services ("Services").
                By accessing or using Zeevo, you agree to be bound by these Terms. If you do not agree, please do not use our Services.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    section.id === 'prohibited' ? 'bg-red-100' : 'bg-indigo-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      section.id === 'prohibited' ? 'text-red-600' : 'text-indigo-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {section.title}
                    </h3>
                    {Array.isArray(section.content) ? (
                      <ul className="space-y-2">
                        {section.content.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700">
                            {section.isProhibited ? (
                              <span className="text-red-500 font-bold mt-1">×</span>
                            ) : (
                              <span className="text-indigo-500 font-bold mt-1">•</span>
                            )}
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{section.content}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

       

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t border-gray-200/50">
          <p className="text-sm text-gray-500">
            © 2025 Zevo. All rights reserved. These terms are effective as of the date listed above.
          </p>
        </div>
      </main>
    </div>
  );
}