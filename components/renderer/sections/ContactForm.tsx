import React, { useState } from 'react';
import { ContactFormSection as ContactFormSectionType } from '@/types/zeevo-types';

interface ContactFormProps {
    data: ContactFormSectionType;
    storeId: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ data, storeId }) => {
    const {
        title,
        titleColor,
        titleFontFamily,
        titleFontSize,
        showEmail,
        showPhone,
        showAddress,
        backgroundColor,
        textColor,
        paddingY,
        paddingX,
    } = data;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId,
                    ...formData,
                }),
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setStatus('error');
        }
    };

    const containerStyle: React.CSSProperties = {
        backgroundColor: backgroundColor || '#ffffff',
        color: textColor || '#111827',
        paddingTop: paddingY ? `${paddingY}px` : '60px',
        paddingBottom: paddingY ? `${paddingY}px` : '60px',
        paddingLeft: paddingX ? `${paddingX}px` : '32px',
        paddingRight: paddingX ? `${paddingX}px` : '32px',
    };

    const titleStyle: React.CSSProperties = {
        color: titleColor,
        fontFamily: titleFontFamily,
        fontSize: titleFontSize ? `${titleFontSize}px` : '36px',
        fontWeight: '700',
        marginBottom: '2rem',
        textAlign: 'center',
    };

    return (
        <section style={containerStyle}>
            <div className="max-w-3xl mx-auto">
                {title && <h2 style={titleStyle}>{title}</h2>}

                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    {status === 'success' ? (
                        <div className="text-center py-12">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Message Sent!</h3>
                            <p className="mt-2 text-gray-500">Thank you for contacting us. We'll get back to you soon.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-6 text-blue-600 hover:text-blue-500 font-medium"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            {status === 'error' && (
                                <div className="text-red-600 text-sm">
                                    Something went wrong. Please try again.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {status === 'submitting' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ContactForm;
