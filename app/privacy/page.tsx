'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Shield, Database, Eye, Lock, UserCheck, Cookie, FileText, Globe, Clock } from 'lucide-react';

export default function PrivacyPolicy() {
  const router = useRouter()
  const handleGoBack = () => {
    
    router.back()
  };

  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      icon: Database,
      content: {
        intro: 'We may collect the following types of information:',
        items: [
          {
            title: 'Information You Provide:',
            description: 'Name, email address, phone number, billing information, account details, business/store details you create.'
          },
          {
            title: 'Automatically Collected:',
            description: 'Device information, usage data, cookies.'
          },
          {
            title: 'Third-Party Payment Data:',
            description: 'Limited transaction details from payment processors like Paystack.'
          }
        ]
      }
    },
    {
      id: 'usage',
      title: '2. How We Use Your Information',
      icon: Eye,
      content: [
        'Provide and improve our Services',
        'Process payments and manage subscriptions',
        'Communicate about your account and orders',
        'Prevent fraud and ensure platform security',
        'Comply with legal obligations'
      ]
    },
    {
      id: 'sharing',
      title: '3. Sharing of Information',
      icon: Globe,
      content: 'We do not sell your personal data. We may share it with service providers, legal authorities when required, and during business transfers such as mergers.'
    },
    {
      id: 'security',
      title: '4. Data Security',
      icon: Lock,
      content: 'We use industry-standard security measures, but no system is 100% secure. Use strong passwords and protect your account credentials.'
    },
    {
      id: 'rights',
      title: '5. Your Rights',
      icon: UserCheck,
      content: 'Depending on your location, you may have the right to access, correct, delete, or request a copy of your data. Contact us to exercise your rights.'
    },
    {
      id: 'cookies',
      title: '6. Cookies and Tracking',
      icon: Cookie,
      content: 'We use cookies to keep you signed in, analyze site traffic, and personalize your experience. You can manage cookies in your browser settings.'
    },
    {
      id: 'retention',
      title: '7. Data Retention',
      icon: Clock,
      content: 'We keep your information as long as your account is active or as needed to provide our Services. Some data may be retained for legal or tax purposes.'
    },
    {
      id: 'links',
      title: '8. Third-Party Links',
      icon: Globe,
      content: 'Our Services may contain links to other websites. We are not responsible for their privacy practices.'
    },
    {
      id: 'updates',
      title: '9. Updates to This Policy',
      icon: FileText,
      content: 'We may update this Privacy Policy from time to time. Changes will be posted here with the updated date.'
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
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Privacy Policy</h1>
              <div className="hidden sm:flex sm:items-center sm:justify-end gap-2 text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: January 2025</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Introduction */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 border border-gray-200/50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 self-start">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Privacy Matters</h2>
              <p className="text-gray-700 leading-relaxed">
                Zeevo ("we," "our," "us") values your privacy. This Privacy Policy explains how we collect, 
                use, and protect your information when you use our website, mobile application, and related 
                services (collectively, the "Services").
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 self-start">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {section.title}
                    </h3>
                    
                    {/* Handle different content types */}
                    {typeof section.content === 'string' ? (
                      <p className="text-gray-700 leading-relaxed">{section.content}</p>
                    ) : Array.isArray(section.content) ? (
                      <ul className="space-y-2">
                        {section.content.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700">
                            <span className="text-indigo-500 font-bold mt-1">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : section.content.intro ? (
                      <div>
                        <p className="text-gray-700 leading-relaxed mb-4">{section.content.intro}</p>
                        <div className="space-y-3">
                          {section.content.items.map((item, index) => (
                            <div key={index} className="bg-gray-50/50 rounded-lg p-4">
                              <p className="text-gray-700">
                                <strong className="text-gray-900">{item.title}</strong> {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t border-gray-200/50">
          <p className="text-sm text-gray-500">
            © 2025 Zeevo. All rights reserved. This privacy policy is effective as of the date listed above.
          </p>
        </div>
      </main>
    </div>
  );
}