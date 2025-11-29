/**
 * Zeevo Page Renderer - Type Definitions
 * Standalone types for rendering Zeevo editor pages
 */

// ====================
// Device & Display Types
// ====================
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface ResponsiveValue<T> {
    desktop?: T;
    tablet?: T;
    mobile?: T;
}

// ====================
// Section Types
// ====================
export type SectionType =
    | 'hero'
    | 'banner'
    | 'product-grid'
    | 'testimonials'
    | 'contact-form'
    | 'gallery'
    | 'about'
    | 'footer'
    | 'navbar'
    | 'spacer'
    | 'faq';

// ====================
// Base Section Interface
// ====================
export interface BaseSection {
    id: string;
    type: SectionType;
    order: number;
}

// ====================
// Section-Specific Interfaces
// ====================
export interface HeroSection extends BaseSection {
    type: 'hero';
    title: string;
    titleColor?: string;
    titleFontFamily?: string;
    titleFontSize?: number;
    titleFontWeight?: string;
    description?: string;
    descriptionColor?: string;
    descriptionFontFamily?: string;
    descriptionFontSize?: number;
    descriptionFontWeight?: string;
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
    imagePosition?: 'left' | 'right' | 'bottom';
    buttons: {
        text: string;
        link: string;
        backgroundColor?: string;
        textColor?: string;
    }[];
    backgroundColor?: string;
    backgroundImage?: string;
    textColor?: string;
    paddingY?: number;
    paddingX?: number;
    padding?: ResponsiveValue<string>;
    minHeight?: string;
    uploading?: boolean;
}

export interface BannerSection extends BaseSection {
    type: 'banner';
    text: string;
    textFontFamily?: string;
    textFontSize?: number;
    textFontWeight?: string;
    link?: string;
    backgroundColor?: string;
    textColor?: string;
    paddingY?: number;
    paddingX?: number;
    padding?: ResponsiveValue<string>;
}

export interface ProductGridSection extends BaseSection {
    type: 'product-grid';
    title?: string;
    titleColor?: string;
    titleFontFamily?: string;
    titleFontSize?: number;
    titleFontWeight?: string;
    productLimit: number;
    columns?: number;
    backgroundColor?: string;
    paddingY?: number;
    paddingX?: number;
    padding?: ResponsiveValue<string>;
    productOverrides?: {
        [productId: string]: {
            name?: string;
            price?: string;
        };
    };
    filterTags?: string[];
    cardBorderColor?: string;
    productNameColor?: string;
    productPriceColor?: string;
}

export interface TestimonialsSection extends BaseSection {
    type: 'testimonials';
    title?: string;
    titleColor?: string;
    titleFontFamily?: string;
    titleFontSize?: number;
    titleFontWeight?: string;
    testimonials: {
        quote: string;
        author: string;
        role?: string;
        avatar?: string;
    }[];
    backgroundColor?: string;
    textColor?: string;
    paddingY?: number;
    paddingX?: number;
    padding?: ResponsiveValue<string>;
}

export interface ContactFormSection extends BaseSection {
    type: 'contact-form';
    title?: string;
    titleColor?: string;
    titleFontFamily?: string;
    titleFontSize?: number;
    showEmail?: boolean;
    showPhone?: boolean;
    showAddress?: boolean;
    backgroundColor?: string;
    textColor?: string;
    paddingY?: number;
    paddingX?: number;
    padding?: ResponsiveValue<string>;
}

export interface GallerySection extends BaseSection {
    type: 'gallery';
    title?: string;
    titleColor?: string;
    titleFontFamily?: string;
    titleFontSize?: number;
    images: {
        url: string;
        caption?: string;
        width?: number;
        height?: number;
    }[];
    columns?: number;
    spacing?: number;
    backgroundColor?: string;
    paddingY?: number;
    paddingX?: number;
    padding?: ResponsiveValue<string>;
}

export interface AboutSection extends BaseSection {
    type: 'about';
    title?: string;
    titleColor?: string;
    titleFontFamily?: string;
    titleFontSize?: number;
    content: string;
    contentColor?: string;
    contentFontFamily?: string;
    contentFontSize?: number;
    imageUrl?: string;
    imagePosition?: 'left' | 'right';
    features?: {
        icon?: string;
        title: string;
        description: string;
    }[];
    backgroundColor?: string;
    textColor?: string;
    paddingY?: number;
    paddingX?: number;
    padding?: ResponsiveValue<string>;
}

export interface FooterSection extends BaseSection {
    type: 'footer';
    text?: string;
    textColor?: string;
    textFontFamily?: string;
    textFontSize?: number;
    showSocial?: boolean;
    links?: {
        label: string;
        url: string;
    }[];
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
    };
    backgroundColor?: string;
    paddingY?: number;
    paddingX?: number;
    padding?: ResponsiveValue<string>;
}

export interface NavbarSection extends BaseSection {
    type: 'navbar';
    logoText: string;
    logoImage?: string;
    links: {
        text: string;
        url: string;
    }[];
    button?: {
        text: string;
        url: string;
        backgroundColor: string;
        textColor: string;
    };
    backgroundColor?: string;
    textColor?: string;
    paddingY?: number;
    paddingX?: number;
    padding?: ResponsiveValue<string>;
    variant?: 'default' | 'pill';
}

export interface SpacerSection extends BaseSection {
    type: 'spacer';
    height?: number;
    backgroundColor?: string;
}

export interface FaqSection extends BaseSection {
    type: 'faq';
    title?: string;
    titleColor?: string;
    titleFontFamily?: string;
    titleFontSize?: number;
    items: {
        question: string;
        answer: string;
        backgroundColor?: string;
        textColor?: string;
    }[];
    backgroundColor?: string;
    textColor?: string;
    paddingY?: number;
    paddingX?: number;
}

// ====================
// Union Type
// ====================
export type Section =
    | HeroSection
    | BannerSection
    | ProductGridSection
    | TestimonialsSection
    | ContactFormSection
    | GallerySection
    | AboutSection
    | FooterSection
    | NavbarSection
    | SpacerSection
    | FaqSection;

// ====================
// Page Structure
// ====================
export interface Page {
    _id: string;
    storeId: string;
    title: string;
    slug: string;
    blocks: Section[];
    isPublished: boolean;
    seoDescription?: string;
    seoTitle?: string;
    createdAt?: string;
    updatedAt?: string;
    settings?: {
        fontFamily?: string;
        seo?: {
            title?: string;
            description?: string;
        };
    };
}

// ====================
// Helper Type Guards
// ====================
export function isHeroSection(section: Section): section is HeroSection {
    return section.type === 'hero';
}
export function isBannerSection(section: Section): section is BannerSection {
    return section.type === 'banner';
}
export function isProductGridSection(section: Section): section is ProductGridSection {
    return section.type === 'product-grid';
}
export function isTestimonialsSection(section: Section): section is TestimonialsSection {
    return section.type === 'testimonials';
}
export function isContactFormSection(section: Section): section is ContactFormSection {
    return section.type === 'contact-form';
}
export function isGallerySection(section: Section): section is GallerySection {
    return section.type === 'gallery';
}
export function isAboutSection(section: Section): section is AboutSection {
    return section.type === 'about';
}
export function isFooterSection(section: Section): section is FooterSection {
    return section.type === 'footer';
}
export function isNavbarSection(section: Section): section is NavbarSection {
    return section.type === 'navbar';
}
export function isSpacerSection(section: Section): section is SpacerSection {
    return section.type === 'spacer';
}
export function isFaqSection(section: Section): section is FaqSection {
    return section.type === 'faq';
}
