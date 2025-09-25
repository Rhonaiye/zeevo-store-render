import React, { useState } from "react";
import { ChevronRight, ChevronLeft, Shield, Check, Phone, Calendar, X, ArrowRight } from 'lucide-react';

interface BVNData {
  number: string;
  phoneNumber: string;
  dateOfBirth: string;
}

interface FormData {
  bvn: BVNData;
}

interface Step {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const KYCOnboardingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    bvn: {
      number: '',
      phoneNumber: '',
      dateOfBirth: ''
    }
  });

  const steps: Step[] = [
    {
      id: 'bvn',
      title: 'BVN Verification',
      icon: Shield,
      description: 'Enter your Bank Verification Number'
    },
    {
      id: 'review',
      title: 'Review & Submit',
      icon: Check,
      description: 'Confirm your details'
    }
  ];

  const updateFormData = (section: keyof FormData, field: keyof BVNData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  const handleSubmit = () => {
    console.log('BVN Data submitted:', formData);
    setIsOpen(false);
    setCurrentStep(0);
  };

  const renderBVNVerification = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-gray-800" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">BVN Verification</h3>
        <p className="text-sm text-gray-600">We use your BVN to verify your identity quickly and securely</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bank Verification Number (BVN)</label>
          <input
            type="text"
            value={formData.bvn.number}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('bvn', 'number', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all text-center text-lg font-mono tracking-wider"
            placeholder="Enter your 11-digit BVN"
            maxLength={11}
          />
          <p className="text-xs text-gray-500 mt-1">Your BVN is an 11-digit number provided by your bank</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (linked to BVN)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              value={formData.bvn.phoneNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('bvn', 'phoneNumber', e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
              placeholder="+234 (xxx) xxx-xxxx"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter the phone number registered with your BVN</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={formData.bvn.dateOfBirth}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('bvn', 'dateOfBirth', e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">This should match the date of birth on your BVN</p>
        </div>
      </div>

      <div className="bg-[#22C55E] border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-gray-800 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-1">Why do we need your BVN?</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Verify your identity instantly without documents</li>
              <li>• Comply with Nigerian financial regulations</li>
              <li>• Ensure secure and legitimate transactions</li>
              <li>• Your BVN details are encrypted and securely stored</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Phone className="h-5 w-5 text-gray-800 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-800">
              <strong>Don't know your BVN?</strong> Dial <span className="font-mono">*565*0#</span> from the phone number 
              registered with your bank account to get your BVN.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-[#22C55E] rounded-full flex items-center justify-center mb-2">
          <Check className="h-6 w-6 text-gray-800" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Review Your Information</h3>
        <p className="text-sm text-gray-600">Please verify your BVN details are correct before submitting</p>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-100 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">BVN Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">BVN Number:</span>
              <span className="font-mono font-medium">
                {formData.bvn.number ? `***-***-${formData.bvn.number.slice(-3)}` : 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone Number:</span>
              <span className="font-medium">{formData.bvn.phoneNumber || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date of Birth:</span>
              <span className="font-medium">{formData.bvn.dateOfBirth || 'Not provided'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#22C55E] border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-gray-800 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-1">What happens next?</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• We'll verify your BVN with the Central Bank of Nigeria</li>
              <li>• Your identity will be confirmed within 24 hours</li>
              <li>• You'll receive a notification once verification is complete</li>
              <li>• Your account will be activated for full access</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-800">
          By submitting this form, you agree to our Terms of Service and Privacy Policy. 
          Your BVN information will be securely processed and stored according to CBN regulations and data protection laws.
        </p>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderBVNVerification();
      case 1: return renderReview();
      default: return null;
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div
        onClick={() => setIsOpen(true)}
        className="fixed flex items-center justify-between left-0 right-0 rounded-t-2xl bottom-0 w-full z-50 bg-[#16A34A] text-base text-gray-50 px-8  xl:px-16 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
      >
       <p>Get verified to start accepting customer payments.</p>
       <button className="hidden  bg-white text-[#16A34A] cursor-pointer px-3 md:flex items-center rounded-md py-1">
           Start Verification 
           <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[85%] max-h-[90vh] overflow-hidden animate-in fade-in duration-300">
            <div className="relative bg-[#22C55E] text-gray-800 p-6">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-200 hover:bg-opacity-20 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-gray-800" />
              </button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-1">BVN Verification</h1>
                <p className="text-gray-700">Quick identity verification with your BVN</p>
              </div>

              <div className="flex items-center justify-center mt-4 space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentStep ? 'bg-gray-800 w-8' : 
                      index < currentStep ? 'bg-gray-600 w-6' : 'bg-gray-400 w-6'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  {React.createElement(steps[currentStep].icon, {
                    className: "h-6 w-6 text-gray-800"
                  })}
                  <h2 className="text-xl font-semibold text-gray-900">
                    {steps[currentStep].title}
                  </h2>
                </div>
                <p className="text-gray-600 text-sm">{steps[currentStep].description}</p>
              </div>

              <div className="min-h-[20rem]">
                {renderStepContent()}
              </div>
            </div>

            <div className="border-t bg-gray-50 px-6 py-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    currentStep === 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 shadow-sm hover:shadow'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>

                <button
                  onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                  className={`w-4/5 flex items-center justify-center px-6 py-3 rounded-lg font-medium text-gray-800 transition-all shadow-sm hover:shadow bg-[#22C55E] hover:bg-[#16A34A]`}
                >
                  {currentStep === steps.length - 1 ? 'Submit Application' : 'Next'}
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCOnboardingModal;