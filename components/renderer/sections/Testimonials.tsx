import React from 'react';
import { TestimonialsSection as TestimonialsSectionType } from '@/types/zeevo-types';

interface TestimonialsProps {
    data: TestimonialsSectionType;
}

const Testimonials: React.FC<TestimonialsProps> = ({ data }) => {
    const {
        title,
        titleColor,
        titleFontFamily,
        titleFontSize,
        titleFontWeight,
        testimonials,
        backgroundColor,
        textColor,
        paddingY,
        paddingX,
    } = data;

    const containerStyle: React.CSSProperties = {
        backgroundColor: backgroundColor || '#F9FAFB',
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
        fontWeight: titleFontWeight || '700',
        marginBottom: '3rem',
        textAlign: 'center',
    };

    return (
        <section style={containerStyle}>
            <div className="max-w-7xl mx-auto">
                {title && <h2 style={titleStyle}>{title}</h2>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full"
                        >
                            <div className="flex-1">
                                <svg className="h-8 w-8 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 7.55228 14.017 7V3H19.017C20.6739 3 22.017 4.34315 22.017 6V15C22.017 16.6569 20.6739 18 19.017 18H16.017C15.4647 18 15.017 18.4477 15.017 19V21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 7.55228 5.0166 7V3H10.0166C11.6735 3 13.0166 4.34315 13.0166 6V15C13.0166 16.6569 11.6735 18 10.0166 18H7.0166C6.46432 18 6.0166 18.4477 6.0166 19V21H5.0166Z" />
                                </svg>
                                <p className="text-gray-600 text-lg italic mb-6">"{testimonial.quote}"</p>
                            </div>

                            <div className="flex items-center gap-4">
                                {testimonial.avatar ? (
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.author}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                                        {testimonial.author.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                                    {testimonial.role && (
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
