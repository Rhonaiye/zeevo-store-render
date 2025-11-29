import React from 'react';
import { GallerySection as GallerySectionType } from '@/types/zeevo-types';

interface GalleryProps {
    data: GallerySectionType;
}

const Gallery: React.FC<GalleryProps> = ({ data }) => {
    const {
        title,
        titleColor,
        titleFontFamily,
        titleFontSize,
        images,
        columns = 3,
        spacing = 16,
        backgroundColor,
        paddingY,
        paddingX,
    } = data;

    const containerStyle: React.CSSProperties = {
        backgroundColor: backgroundColor || '#ffffff',
        paddingTop: paddingY ? `${paddingY}px` : '60px',
        paddingBottom: paddingY ? `${paddingY}px` : '60px',
        paddingLeft: paddingX ? `${paddingX}px` : '32px',
        paddingRight: paddingX ? `${paddingX}px` : '32px',
    };

    const titleStyle: React.CSSProperties = {
        color: titleColor || '#111827',
        fontFamily: titleFontFamily,
        fontSize: titleFontSize ? `${titleFontSize}px` : '36px',
        fontWeight: '700',
        marginBottom: '2rem',
        textAlign: 'center',
    };

    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
        gap: `${spacing}px`,
    };

    return (
        <section style={containerStyle}>
            <div className="max-w-7xl mx-auto">
                {title && <h2 style={titleStyle}>{title}</h2>}

                <div style={gridStyle}>
                    {images.map((img, index) => (
                        <div key={index} className="relative group overflow-hidden rounded-lg">
                            <img
                                src={img.url}
                                alt={img.caption || `Gallery image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                style={{
                                    aspectRatio: '1 / 1', // Force square aspect ratio for grid consistency
                                }}
                            />
                            {img.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {img.caption}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Gallery;
