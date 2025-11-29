import React from 'react';
import { AboutSection as AboutSectionType } from '@/types/zeevo-types';

interface AboutProps {
    data: AboutSectionType;
}

const About: React.FC<AboutProps> = ({ data }) => {
    const {
        title,
        titleColor,
        titleFontFamily,
        titleFontSize,
        content,
        contentColor,
        contentFontFamily,
        contentFontSize,
        imageUrl,
        imagePosition = 'right',
        features,
        backgroundColor,
        textColor,
        paddingY,
        paddingX,
    } = data;

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
        marginBottom: '1.5rem',
    };

    const contentStyle: React.CSSProperties = {
        color: contentColor,
        fontFamily: contentFontFamily,
        fontSize: contentFontSize ? `${contentFontSize}px` : '18px',
        lineHeight: 1.6,
        marginBottom: '2rem',
        whiteSpace: 'pre-wrap', // Preserve newlines
    };

    return (
        <section style={containerStyle}>
            <div className={`max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center`}>
                {/* Content Side */}
                <div className={`flex-1 ${imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1'}`}>
                    {title && <h2 style={titleStyle}>{title}</h2>}
                    <div style={contentStyle}>{content}</div>

                    {features && features.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                            {features.map((feature, index) => (
                                <div key={index} className="flex gap-4">
                                    {feature.icon && (
                                        <div className="flex-shrink-0 text-2xl">{feature.icon}</div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                                        <p className="text-gray-600 text-sm">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Image Side */}
                {imageUrl && (
                    <div className={`flex-1 ${imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'} w-full`}>
                        <img
                            src={imageUrl}
                            alt={title || 'About Us'}
                            className="w-full h-auto rounded-lg shadow-md object-cover"
                            style={{ maxHeight: '500px' }}
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default About;
