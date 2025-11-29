import React, { useState } from 'react';
import { NavbarSection as NavbarSectionType } from '@/types/zeevo-types';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
    data: NavbarSectionType;
    heroBackgroundColor?: string;
}

const Navbar: React.FC<NavbarProps> = ({ data, heroBackgroundColor }) => {
    const {
        logoText,
        logoImage,
        links,
        button,
        backgroundColor,
        textColor,
        paddingY,
        paddingX,
        variant = 'default',
    } = data;

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isPill = variant === 'pill';
    const heroBgColor = heroBackgroundColor || '#f9fafb';

    const containerStyle: React.CSSProperties = {
        backgroundColor: isPill ? heroBgColor : (backgroundColor || '#ffffff'),
        color: textColor || '#111827',
        paddingTop: isPill ? '16px' : (paddingY ? `${paddingY}px` : '20px'),
        paddingBottom: isPill ? '0px' : (paddingY ? `${paddingY}px` : '20px'),
        paddingLeft: isPill ? '16px' : (paddingX ? `${paddingX}px` : '32px'),
        paddingRight: isPill ? '16px' : (paddingX ? `${paddingX}px` : '32px'),
    };

    const containerClasses = isPill
        ? "w-[calc(100%-32px)] max-w-5xl mx-auto rounded-full border border-gray-100"
        : "w-full";

    return (
        <div
            className="relative transition-all duration-200"
            style={containerStyle}
        >
            <div
                className={containerClasses}
                style={{
                    backgroundColor: isPill ? (backgroundColor || '#ffffff') : 'transparent',
                    color: textColor || '#111827',
                    padding: isPill ? '12px 32px' : undefined,
                }}
            >
                <div className={isPill ? "w-full" : "max-w-7xl mx-auto"}>
                    <div className="flex items-center justify-between">

                        {/* Header: Logo + Mobile Toggle */}
                        <div className="flex items-center justify-between w-full md:w-auto">
                            {/* Logo */}
                            <Link href="/" className="relative">
                                {logoImage ? (
                                    <img src={logoImage} alt={logoText} className="h-8 w-auto object-contain" />
                                ) : (
                                    <h2 className="text-2xl font-bold">
                                        {logoText}
                                    </h2>
                                )}
                            </Link>

                            {/* Mobile Toggle Button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-gray-600 hover:text-gray-900 transition-colors block md:hidden"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                        {/* Navigation & CTA Container (Desktop) */}
                        <div className="hidden md:flex md:flex-row md:items-center md:gap-8 md:w-auto">
                            {/* Navigation Links */}
                            <div className="flex flex-col gap-3 items-center md:flex-row md:gap-8">
                                {links && links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className="text-sm font-medium hover:opacity-80 transition-opacity"
                                    >
                                        {link.text}
                                    </Link>
                                ))}
                            </div>

                            {/* CTA Button */}
                            {button && (
                                <div>
                                    <Link
                                        href={button.url}
                                        className="px-4 py-2 rounded-md text-sm font-medium transition-colors inline-block text-center"
                                        style={{
                                            backgroundColor: button.backgroundColor,
                                            color: button.textColor,
                                        }}
                                    >
                                        {button.text}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-col gap-4 z-50 md:hidden">
                    {/* Navigation Links */}
                    <div className="flex flex-col gap-3 items-center">
                        {links && links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url}
                                className="text-sm font-medium hover:opacity-80 transition-opacity"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Button */}
                    {button && (
                        <div className="w-full">
                            <Link
                                href={button.url}
                                className="px-4 py-2 rounded-md text-sm font-medium transition-colors inline-block w-full text-center"
                                style={{
                                    backgroundColor: button.backgroundColor,
                                    color: button.textColor,
                                }}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {button.text}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Navbar;
