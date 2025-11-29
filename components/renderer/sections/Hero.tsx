import React from 'react';
import { HeroSection as HeroSectionType } from '@/types/zeevo-types';
import Link from 'next/link';

interface HeroProps {
    data: HeroSectionType;
}

const Hero: React.FC<HeroProps> = ({ data }) => {
    const {
        title,
        titleColor,
        titleFontFamily,
        titleFontSize,
        titleFontWeight,
        description,
        descriptionColor,
        descriptionFontFamily,
        descriptionFontSize,
        descriptionFontWeight,
        imageUrl,
        imageWidth,
        imageHeight,
        imagePosition = 'right',
        buttons,
        backgroundColor,
        textColor,
        paddingY,
        paddingX,
    } = data;

    return (
        <div
            className="w-full relative"
            style={{
                backgroundColor: backgroundColor || '#f9fafb',
                color: textColor || '#111827',
                paddingTop: `${paddingY ?? 80}px`,
                paddingBottom: `${paddingY ?? 80}px`,
                paddingLeft: `${paddingX ?? 32}px`,
                paddingRight: `${paddingX ?? 32}px`,
            }}
        >
            <div className={`max-w-6xl mx-auto flex items-center gap-12 ${imagePosition === 'left' ? 'flex-col md:flex-row-reverse' :
                    imagePosition === 'bottom' ? 'flex-col md:text-center' :
                        'flex-col md:flex-row'
                }`}>
                <div className="flex-1">
                    {/* Title */}
                    <div className="mb-4">
                        <h1
                            className="text-5xl font-bold inline-block"
                            style={{
                                color: titleColor || textColor || '#111827',
                                fontFamily: titleFontFamily,
                                fontSize: titleFontSize ? `${titleFontSize}px` : undefined,
                                fontWeight: titleFontWeight,
                            }}
                        >
                            {title}
                        </h1>
                    </div>

                    {/* Description */}
                    {description && (
                        <div className="mb-6">
                            <p
                                className="text-xl opacity-90 inline-block"
                                style={{
                                    color: descriptionColor || textColor || '#111827',
                                    fontFamily: descriptionFontFamily,
                                    fontSize: descriptionFontSize ? `${descriptionFontSize}px` : undefined,
                                    fontWeight: descriptionFontWeight,
                                }}
                            >
                                {description}
                            </p>
                        </div>
                    )}

                    {/* Buttons */}
                    {buttons && buttons.length > 0 && (
                        <div className={`flex flex-row gap-4 flex-wrap items-center ${imagePosition === 'bottom' ? 'md:justify-center' : ''
                            }`}>
                            {buttons.map((btn, idx) => (
                                <Link
                                    key={idx}
                                    href={btn.link}
                                    className="px-6 py-3 rounded-lg font-semibold inline-block transition-opacity hover:opacity-90"
                                    style={{
                                        backgroundColor: btn.backgroundColor || '#5CB87A',
                                        color: btn.textColor || '#ffffff',
                                    }}
                                >
                                    {btn.text}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Image Area */}
                {imageUrl && (
                    <div className="flex-1 flex justify-center relative">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="rounded-lg shadow-lg object-cover"
                            style={{
                                width: imageWidth ? `${imageWidth}px` : '100%',
                                height: imageHeight ? `${imageHeight}px` : 'auto',
                                maxWidth: '100%',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hero;
