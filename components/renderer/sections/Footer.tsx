import React from 'react';
import { FooterSection as FooterSectionType } from '@/types/zeevo-types';

interface FooterProps {
    data: FooterSectionType;
}

const Footer: React.FC<FooterProps> = ({ data }) => {
    const {
        text,
        textColor,
        backgroundColor,
        paddingY,
        paddingX,
    } = data;

    return (
        <div
            className="w-full relative"
            style={{
                backgroundColor: backgroundColor || '#1f2937',
                color: textColor || '#ffffff',
                paddingTop: `${paddingY ?? 48}px`,
                paddingBottom: `${paddingY ?? 48}px`,
                paddingLeft: `${paddingX ?? 32}px`,
                paddingRight: `${paddingX ?? 32}px`,
            }}
        >
            <div className="max-w-6xl mx-auto text-center">
                {/* Footer text */}
                <div className="relative inline-block">
                    <p
                        className="text-base opacity-80"
                        style={{ color: textColor || '#ffffff', fontSize: '16px' }}
                    >
                        {text || '© 2024 Your Company. All rights reserved.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Footer;
