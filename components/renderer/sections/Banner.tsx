import React from 'react';
import { BannerSection as BannerSectionType } from '@/types/zeevo-types';
import Link from 'next/link';

interface BannerProps {
    data: BannerSectionType;
}

const Banner: React.FC<BannerProps> = ({ data }) => {
    const {
        text,
        textFontFamily,
        textFontSize,
        textFontWeight,
        link,
        backgroundColor,
        textColor,
        paddingY,
        paddingX,
    } = data;

    return (
        <div
            className="w-full text-center relative"
            style={{
                backgroundColor: backgroundColor || '#5CB87A',
                color: textColor || '#ffffff',
                paddingTop: `${paddingY ?? 16}px`,
                paddingBottom: `${paddingY ?? 16}px`,
                paddingLeft: `${paddingX ?? 32}px`,
                paddingRight: `${paddingX ?? 32}px`,
            }}
        >
            <div className="relative inline-block">
                {link ? (
                    <Link href={link} className="text-lg font-semibold hover:opacity-90">
                        <span
                            className="outline-none rounded px-2"
                            style={{
                                fontFamily: textFontFamily,
                                fontSize: textFontSize ? `${textFontSize}px` : undefined,
                                fontWeight: textFontWeight,
                            }}
                        >
                            {text}
                        </span>
                    </Link>
                ) : (
                    <p
                        className="text-lg font-semibold outline-none rounded px-2 inline-block"
                        style={{
                            fontFamily: textFontFamily,
                            fontSize: textFontSize ? `${textFontSize}px` : undefined,
                            fontWeight: textFontWeight,
                        }}
                    >
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Banner;
