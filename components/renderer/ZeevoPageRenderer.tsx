import React from 'react';
import { Page, Section } from '@/types/zeevo-types';
import Hero from './sections/Hero';
import Banner from './sections/Banner';
import ProductGrid from './sections/ProductGrid';
import Testimonials from './sections/Testimonials';
import ContactForm from './sections/ContactForm';
import Gallery from './sections/Gallery';
import About from './sections/About';
import Footer from './sections/Footer';
import Navbar from './sections/Navbar';
import Spacer from './sections/Spacer';
import Faq from './sections/Faq';

interface ZeevoPageRendererProps {
    page: Page;
    storeId?: string;
    store?: any;
}

const ZeevoPageRenderer: React.FC<ZeevoPageRendererProps> = ({ page, storeId: propStoreId, store }) => {
    const { blocks = [], content = [], storeId: pageStoreId, settings } = page as any;
    const storeId = propStoreId || pageStoreId;

    // Handle different data structures (blocks vs content)
    const sectionsToRender = (blocks.length > 0 ? blocks : content).map((item: any) => {
        // If the item has a nested 'content' property that looks like a section, use it
        if (item.content && typeof item.content === 'object' && !item.content.length) {
            return {
                ...item.content,
                // Ensure id and type are preserved from parent if missing in content (though they seem to be in content based on logs)
                id: item.content.id || item.id,
                type: item.content.type || item.type,
            };
        }
        return item;
    });

    // Find hero section to get its background color for navbar pill variant
    const heroSection = sectionsToRender.find((s: any) => s.type === 'hero');
    const heroBackgroundColor = heroSection?.backgroundColor;

    const renderSection = (section: Section) => {
        switch (section.type) {
            case 'hero':
                return <Hero key={section.id} data={section} />;
            case 'banner':
                return <Banner key={section.id} data={section} />;
            case 'product-grid':
                return <ProductGrid
                    key={section.id}
                    data={section}
                    storeId={storeId}
                    products={store?.products || []}
                    currency={store?.currency || '$'}
                />;
            case 'testimonials':
                return <Testimonials key={section.id} data={section} />;
            case 'contact-form':
                return <ContactForm key={section.id} data={section} storeId={storeId} />;
            case 'gallery':
                return <Gallery key={section.id} data={section} />;
            case 'about':
                return <About key={section.id} data={section} />;
            case 'footer':
                return <Footer key={section.id} data={section} />;
            case 'navbar':
                return <Navbar key={section.id} data={section} heroBackgroundColor={heroBackgroundColor} />;
            case 'spacer':
                return <Spacer key={section.id} data={section} />;
            case 'faq':
                return <Faq key={section.id} data={section} />;
            default:
                console.warn(`Unknown section type: ${(section as any).type}`);
                return null;
        }
    };

    const fontFamily = settings?.fontFamily || 'Inter, sans-serif';

    return (
        <div
            className="zeevo-page-renderer min-h-screen flex flex-col"
            style={{ fontFamily }}
        >
            {/* Load Google Font if needed */}
            {settings?.fontFamily && (
                <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=${settings.fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap');
        `}</style>
            )}

            {sectionsToRender
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                .map((section: any) => renderSection(section))}
        </div>
    );
};

export default ZeevoPageRenderer;
