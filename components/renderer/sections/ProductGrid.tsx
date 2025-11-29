import React, { useEffect, useState } from 'react';
import { ProductGridSection as ProductGridSectionType } from '@/types/zeevo-types';
import Link from 'next/link';

interface ProductGridProps {
    data: ProductGridSectionType;
    storeId: string;
    products?: Product[];
    currency?: string;
}

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
    category?: string;
    tags?: string[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ data, storeId, products: initialProducts = [], currency: initialCurrency = '$' }) => {
    const {
        title,
        titleColor,
        titleFontFamily,
        titleFontSize,
        titleFontWeight,
        productLimit,
        columns = 3,
        backgroundColor,
        paddingY,
        paddingX,
        productOverrides,
        filterTags,
        cardBorderColor,
        productNameColor,
        productPriceColor,
    } = data;

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(initialProducts.length === 0);
    const [currency, setCurrency] = useState(initialCurrency);

    useEffect(() => {
        // If products were passed as props, we don't need to fetch
        if (initialProducts.length > 0) {
            console.log('🛒 ProductGrid: Using passed products:', initialProducts);

            let filteredProducts = [...initialProducts];

            // Filter by tags if needed
            if (filterTags && filterTags.length > 0) {
                console.log('🛒 ProductGrid: Filtering by tags:', filterTags);
                filteredProducts = filteredProducts.filter((p) =>
                    p.tags && p.tags.some((tag) => filterTags.includes(tag))
                );
            }

            // Apply limit
            const finalProducts = filteredProducts.slice(0, productLimit || 6);
            setProducts(finalProducts);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            console.log('🛒 ProductGrid: Fetching data for storeId:', storeId);
            if (!storeId) {
                console.warn('🛒 ProductGrid: No storeId provided');
                setLoading(false);
                return;
            }

            try {
                // Fetch store details for currency
                const storeRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/${storeId}`);
                const storeResult = await storeRes.json();
                if (storeResult.success && storeResult.data) {
                    setCurrency(storeResult.data.currency || '$');
                }

                // Fetch products
                const productsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/${storeId}/products`;
                console.log('🛒 ProductGrid: Fetching products from:', productsUrl);

                const res = await fetch(productsUrl);
                const result = await res.json();
                console.log('🛒 ProductGrid: Products API Result:', result);

                if (result.success && Array.isArray(result.data)) {
                    let fetchedProducts = result.data;
                    console.log('🛒 ProductGrid: Raw fetched products:', fetchedProducts);

                    // Filter by tags if needed
                    if (filterTags && filterTags.length > 0) {
                        console.log('🛒 ProductGrid: Filtering by tags:', filterTags);
                        fetchedProducts = fetchedProducts.filter((p: any) =>
                            p.tags && p.tags.some((tag: string) => filterTags.includes(tag))
                        );
                    }

                    // Apply limit
                    const finalProducts = fetchedProducts.slice(0, productLimit || 6);
                    console.log('🛒 ProductGrid: Final products to render:', finalProducts);
                    setProducts(finalProducts);
                } else {
                    console.error('🛒 ProductGrid: Invalid API response format', result);
                }
            } catch (error) {
                console.error('🛒 ProductGrid: Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [storeId, productLimit, filterTags]);

    // Responsive columns logic
    // We'll use Tailwind's grid-cols classes dynamically or style prop
    // Mobile is always 2 columns (handled via CSS media queries or conditional class)

    return (
        <div
            className="w-full relative"
            style={{
                backgroundColor: backgroundColor || '#ffffff',
                paddingTop: `${paddingY ?? 64}px`,
                paddingBottom: `${paddingY ?? 64}px`,
                paddingLeft: `${paddingX ?? 32}px`,
                paddingRight: `${paddingX ?? 32}px`,
            }}
        >
            <div className="max-w-6xl mx-auto">
                {/* Section Title */}
                {title && (
                    <div className="text-center mb-12">
                        <h2
                            className="text-3xl font-bold inline-block"
                            style={{
                                color: titleColor || '#111827',
                                fontFamily: titleFontFamily,
                                fontSize: titleFontSize ? `${titleFontSize}px` : undefined,
                                fontWeight: titleFontWeight,
                            }}
                        >
                            {title}
                        </h2>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <div className={`grid gap-6 grid-cols-2 ${columns === 3 ? 'md:grid-cols-3' :
                        columns === 4 ? 'md:grid-cols-4' :
                            'md:grid-cols-3'
                        }`}>
                        {products.map((product) => {
                            const override = productOverrides?.[product._id];
                            const displayName = override?.name || product.name;
                            const displayPrice = override?.price ?? product.price;
                            const imageUrl = product.images?.[0];

                            return (
                                <Link
                                    key={product._id}
                                    href={`/store/${storeId}/product/${product.slug}`}
                                    className="border rounded-lg hover:shadow-md transition-shadow relative block group"
                                    style={{
                                        borderColor: cardBorderColor || '#e5e7eb',
                                        borderWidth: '1px',
                                        borderStyle: 'solid'
                                    }}
                                >
                                    {/* Product Image */}
                                    <div className="w-full h-48 bg-gray-200 rounded-t-lg mb-4 overflow-hidden">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={displayName}
                                                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Name */}
                                    <div className="pl-2 pr-2">
                                        <h3
                                            className="font-semibold mb-2 line-clamp-2"
                                            style={{ color: productNameColor || '#111827' }}
                                        >
                                            {displayName}
                                        </h3>
                                    </div>

                                    {/* Product Price */}
                                    <div className="pl-2 pr-2 pb-4">
                                        <p
                                            className="text-sm"
                                            style={{ color: productPriceColor || '#6b7280' }}
                                        >
                                            {currency}{typeof displayPrice === 'number' ? displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : displayPrice}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {products.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        No products found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductGrid;
