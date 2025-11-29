import React from 'react';
import { FaqSection as FaqSectionType } from '@/types/zeevo-types';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

interface FaqProps {
    data: FaqSectionType;
}

const Faq: React.FC<FaqProps> = ({ data }) => {
    const {
        title,
        titleColor,
        titleFontFamily,
        titleFontSize,
        titleFontWeight,
        items,
        backgroundColor,
        textColor,
        paddingY,
        paddingX,
    } = data;

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
            <div className="max-w-3xl mx-auto">
                {/* Title */}
                <div className="mb-12 text-center">
                    <h2
                        className="text-3xl font-bold inline-block"
                        style={{
                            color: titleColor || textColor || '#111827',
                            fontFamily: titleFontFamily,
                            fontSize: titleFontSize ? `${titleFontSize}px` : undefined,
                            fontWeight: titleFontWeight,
                        }}
                    >
                        {title || 'Frequently Asked Questions'}
                    </h2>
                </div>

                {/* Accordion */}
                <Accordion.Root type="multiple" className="space-y-4">
                    {items?.map((item: any, idx: number) => (
                        <Accordion.Item
                            key={idx}
                            value={`item-${idx}`}
                            className="border border-gray-200 rounded-lg overflow-hidden relative group/item transition-colors"
                            style={{ backgroundColor: item.backgroundColor || '#ffffff' }}
                        >
                            <div className="relative flex items-center">
                                <Accordion.Header className="flex-1">
                                    <Accordion.Trigger className="flex flex-1 items-center justify-between w-full p-4 text-left font-medium hover:brightness-95 transition-all [&[data-state=open]>svg]:rotate-180">
                                        <span
                                            className="flex-1 mr-4"
                                            style={{ color: item.textColor || textColor || '#111827' }}
                                        >
                                            {item.question}
                                        </span>
                                        <ChevronDown
                                            className="w-5 h-5 transition-transform duration-200"
                                            style={{ color: item.textColor || '#6b7280' }}
                                        />
                                    </Accordion.Trigger>
                                </Accordion.Header>
                            </div>
                            <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                <div
                                    className="p-4 pt-0 border-t border-gray-100"
                                    style={{ borderColor: item.textColor ? `${item.textColor}20` : undefined }}
                                >
                                    <p
                                        style={{ color: item.textColor ? `${item.textColor}cc` : '#4b5563' }}
                                    >
                                        {item.answer}
                                    </p>
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>
            </div>
        </div>
    );
};

export default Faq;
