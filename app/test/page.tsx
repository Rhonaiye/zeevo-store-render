'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Eye, Settings, Trash2, Download, Save, Smartphone, Monitor, Plus,
  Copy, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon,
  ShoppingBag, Mail, Megaphone, Users, FileText, LayoutGrid,
  ChevronDown, X, SlidersHorizontal, Type, Undo, Redo
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

/* ============================
   Types
============================ */
type BlockType =
  | 'hero-banner'
  | 'product-grid'
  | 'cta-banner'
  | 'newsletter'
  | 'testimonials'
  | 'text-block'
  | 'image-gallery'
  | 'footer';

interface Block<T extends BlockType = BlockType, P = any> {
  id: string;
  type: T;
  props: P;
}

type HeroProps = {
  title: string;
  subtitle: string;
  backgroundImage: string;
  buttonText: string;
  textColor: string;
  buttonColor: string;
  buttonBgColor: string;
};

type ResponsiveColumns = { mobile: 1 | 2; md: 1 | 2 | 3; lg: 1 | 2 | 3 | 4 };

type ProductGridProps = {
  title: string;
  columns: ResponsiveColumns;
  showPrice: boolean;
  showRatings: boolean;
  textColor: string;
};

type CtaProps = {
  title: string;
  subtitle: string;
  buttonText: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonBgColor: string;
};

type NewsletterProps = {
  title: string;
  subtitle: string;
  buttonText: string;
  backgroundColor: string;
  textColor: string;
  inputBgColor: string;
};

type Testimonial = { name: string; text: string; rating: 1|2|3|4|5 };
type TestimonialsProps = {
  title: string;
  testimonials: Testimonial[];
  textColor: string;
  backgroundColor: string;
};

type TextBlockProps = {
  content: string;
  alignment: 'left' | 'center' | 'right';
  textColor: string;
  fontSize: number; // px
  bold: boolean;
  italic: boolean;
  fontFamily?: string; // optional per-block font
};

type ImageGalleryProps = {
  images: string[];
  columns: ResponsiveColumns;
};

type FooterLink = { label: string; url: string };
type FooterProps = {
  text: string;
  links: FooterLink[];
  textColor: string;
  backgroundColor: string;
};

type AnyProps =
  | HeroProps
  | ProductGridProps
  | CtaProps
  | NewsletterProps
  | TestimonialsProps
  | TextBlockProps
  | ImageGalleryProps
  | FooterProps;

/* ============================
   Demo data
============================ */
const DEMO_PRODUCTS = [
  { name: 'Wireless Headphones', price: '$199', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900', rating: 4.5 },
  { name: 'Smart Watch', price: '$299', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900', rating: 4.8 },
  { name: 'Bluetooth Speaker', price: '$149', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900', rating: 4.2 },
  { name: 'Laptop', price: '$999', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b60a0a8?w=1200', rating: 4.7 }
];

/* ============================
   Fonts
============================ */
const FONT_OPTIONS = [
  { label: 'System Default', value: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Noto Sans", "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji"' },
  { label: 'Inter', value: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
  { label: 'Roboto', value: 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif' },
  { label: 'Poppins', value: '"Poppins", system-ui, -apple-system, Segoe UI, Arial, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, Georgia, serif' },
  { label: 'Playfair Display', value: '"Playfair Display", Georgia, serif' },
  { label: 'Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
];

/* ============================
   Block templates (palette)
============================ */
const BLOCK_TEMPLATES: Record<BlockType, { icon: React.ComponentType<any>; label: string; props: AnyProps }> = {
  'hero-banner': {
    icon: LayoutGrid,
    label: 'Hero Banner',
    props: {
      title: 'Welcome to Our Store',
      subtitle: 'Discover great products',
      backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600',
      buttonText: 'Shop Now',
      textColor: '#000000',
      buttonColor: '#ffffff',
      buttonBgColor: '#007bff',
    } satisfies HeroProps
  },
  'product-grid': {
    icon: ShoppingBag,
    label: 'Product Grid',
    props: {
      title: 'Featured Products',
      columns: { mobile: 2, md: 3, lg: 4 },
      showPrice: true,
      showRatings: false,
      textColor: '#000000',
    } satisfies ProductGridProps
  },
  'cta-banner': {
    icon: Megaphone,
    label: 'CTA Banner',
    props: {
      title: 'Special Offer!',
      subtitle: '20% off your first order',
      buttonText: 'Get Discount',
      backgroundColor: '#ff6b35',
      textColor: '#000000',
      buttonColor: '#000000',
      buttonBgColor: '#ffffff',
    } satisfies CtaProps
  },
  'newsletter': {
    icon: Mail,
    label: 'Newsletter',
    props: {
      title: 'Stay Updated',
      subtitle: 'Get the latest news and offers',
      buttonText: 'Subscribe',
      backgroundColor: '#f8f9fa',
      textColor: '#000000',
      inputBgColor: '#ffffff',
    } satisfies NewsletterProps
  },
  'testimonials': {
    icon: Users,
    label: 'Testimonials',
    props: {
      title: 'Customer Reviews',
      testimonials: [{ name: 'John Doe', text: 'Great service and products!', rating: 5 }],
      textColor: '#000000',
      backgroundColor: '#ffffff',
    } satisfies TestimonialsProps
  },
  'text-block': {
    icon: FileText,
    label: 'Text Block',
    props: {
      content: 'Your custom content here...',
      alignment: 'left',
      textColor: '#000000',
      fontSize: 16,
      bold: false,
      italic: false,
      fontFamily: '', // inherit global
    } satisfies TextBlockProps
  },
  'image-gallery': {
    icon: ImageIcon,
    label: 'Image Gallery',
    props: {
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900',
      ],
      columns: { mobile: 1, md: 2, lg: 3 },
    } satisfies ImageGalleryProps
  },
  'footer': {
    icon: FileText,
    label: 'Footer',
    props: {
      text: '© 2025 My Store. All rights reserved.',
      links: [
        { label: 'Privacy', url: '#' },
        { label: 'Terms', url: '#' },
      ],
      textColor: '#000000',
      backgroundColor: '#f8f9fa',
    } satisfies FooterProps
  },
};

/* ============================
   Reusable inputs
============================ */
const Label: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <label className={`block text-[10px] font-semibold uppercase tracking-wide text-gray-500 ${className ?? ''}`}>{children}</label>
);

const TextInput: React.FC<{
  value: string; onChange: (v: string) => void; placeholder?: string; type?: 'text' | 'url' | 'email';
}> = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  />
);

const NumberInput: React.FC<{
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}> = ({ value, onChange, min, max, step = 1 }) => (
  <input
    type="number"
    value={value}
    min={min}
    max={max}
    step={step}
    onChange={(e) => onChange(+e.target.value)}
    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  />
);

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; }> = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`inline-flex h-6 w-11 items-center rounded-full transition ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
    aria-pressed={value}
  >
    <span className={`h-5 w-5 transform rounded-full bg-white shadow transition ${value ? 'translate-x-5' : 'translate-x-1'}`} />
  </button>
);

const ColorInput: React.FC<{ value: string; onChange: (v: string) => void; }> = ({ value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker((v) => !v)}
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 hover:border-blue-500 transition"
      >
        <div className="h-5 w-5 rounded border" style={{ backgroundColor: value }} />
        <span className="flex-1 text-left select-all">{value.toUpperCase()}</span>
      </button>
      {showPicker && (
        <div className="absolute z-10 top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg">
          <HexColorPicker color={value} onChange={onChange} />
          <button
            onClick={() => setShowPicker(false)}
            className="mt-2 w-full px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

const Segmented: React.FC<{
  value: string; onChange: (v: string) => void;
  options: { value: string; icon?: React.ReactNode; label?: string }[];
}> = ({ value, onChange, options }) => (
  <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
    {options.map((opt) => {
      const active = opt.value === value;
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition
            ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
        >
          {opt.icon}{opt.label}
        </button>
      );
    })}
  </div>
);

/* Small accordion (space-efficient) */
const Accordion: React.FC<{
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, defaultOpen, children }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition"
      >
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-3 pb-3 pt-1 space-y-2 bg-white">{children}</div>}
    </div>
  );
};

const RowShell: React.FC<{
  children: React.ReactNode;
  onRemove?: () => void;
}> = ({ children, onRemove }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-2 relative hover:shadow-sm transition">
    {onRemove && (
      <button onClick={onRemove} className="absolute right-1 top-1 p-1 rounded hover:bg-red-50 text-red-600" title="Remove">
        <X size={14} />
      </button>
    )}
    {children}
  </div>
);

/* ============================
   Sortable block card (Canvas)
============================ */
function SortableBlockCard({
  id,
  block,
  onSelect,
  onDelete,
  onDuplicate,
  isSelected,
  isPreview,
  globalFont,
}: {
  id: string;
  block: Block;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isSelected: boolean;
  isPreview: boolean;
  globalFont: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const gridColsClass = (cols: ResponsiveColumns) => `grid-cols-${cols.mobile} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg}`;

  const fontFamily = (block.type === 'text-block' && (block.props as TextBlockProps).fontFamily)
    ? (block.props as TextBlockProps).fontFamily!
    : globalFont;

  const renderPreview = () => {
    switch (block.type) {
      case 'hero-banner': {
        const p = block.props as HeroProps;
        return (
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden" style={{ fontFamily }}>
            <img src={p.backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 pointer-events-none" />
            <div className="relative z-10 h-full w-full flex items-center justify-center text-center px-4" style={{ color: p.textColor }}>
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-extrabold drop-shadow-sm">{p.title}</h2>
                <p className="mt-3 text-lg md:text-xl opacity-95">{p.subtitle}</p>
                <button
                  className="mt-5 inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-medium shadow hover:opacity-90 transition"
                  style={{ color: p.buttonColor, backgroundColor: p.buttonBgColor }}
                >
                  {p.buttonText}
                </button>
              </div>
            </div>
          </div>
        );
      }
      case 'product-grid': {
        const p = block.props as ProductGridProps;
        return (
          <div className="p-4 md:p-6" style={{ fontFamily }}>
            <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: p.textColor }}>{p.title}</h3>
            <div className={`grid ${gridColsClass(p.columns)} gap-4`}>
              {DEMO_PRODUCTS.slice(0, Math.max(1, p.columns.lg * 2)).map((prod, i) => (
                <div key={i} className="border rounded-2xl overflow-hidden bg-white hover:shadow-lg transition">
                  <img src={prod.image} alt="" className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <p className="font-semibold mb-1" style={{ color: p.textColor }}>{prod.name}</p>
                    {p.showPrice && <p className="text-blue-600">{prod.price}</p>}
                    {p.showRatings && <p className="text-yellow-500">{'★'.repeat(Math.floor(prod.rating))}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 'cta-banner': {
        const p = block.props as CtaProps;
        return (
          <div className="p-6 md:p-10 rounded-2xl text-center" style={{ backgroundColor: p.backgroundColor, color: p.textColor, fontFamily }}>
            <h3 className="text-2xl md:text-3xl font-bold">{p.title}</h3>
            <p className="mt-2 md:text-lg">{p.subtitle}</p>
            <button
              className="mt-5 inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-medium shadow hover:opacity-90 transition"
              style={{ color: p.buttonColor, backgroundColor: p.buttonBgColor }}
            >
              {p.buttonText}
            </button>
          </div>
        );
      }
      case 'newsletter': {
        const p = block.props as NewsletterProps;
        return (
          <div className="p-6 md:p-10 rounded-2xl text-center" style={{ backgroundColor: p.backgroundColor, color: p.textColor, fontFamily }}>
            <h3 className="text-2xl md:text-3xl font-bold">{p.title}</h3>
            <p className="mt-2 md:text-lg">{p.subtitle}</p>
            <div className="mt-5 flex flex-col md:flex-row gap-2 justify-center max-w-lg mx-auto">
              <input type="email" placeholder="Your email" className="px-4 py-2 rounded-lg border" style={{ backgroundColor: p.inputBgColor, color: '#000' }} />
              <button className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">{p.buttonText}</button>
            </div>
          </div>
        );
      }
      case 'testimonials': {
        const p = block.props as TestimonialsProps;
        return (
          <div className="p-6 md:p-10 rounded-2xl" style={{ backgroundColor: p.backgroundColor, fontFamily }}>
            <h3 className="text-2xl md:text-3xl font-bold mb-5 text-center" style={{ color: p.textColor }}>{p.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.testimonials.map((t, i) => (
                <div key={i} className="border rounded-2xl p-4 bg-white/80 backdrop-blur hover:shadow transition" style={{ color: p.textColor }}>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-yellow-500">{'★'.repeat(t.rating)}</p>
                  <p className="mt-1 text-gray-700">{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 'text-block': {
        const p = block.props as TextBlockProps;
        return (
          <div className="p-4 md:p-6">
            <p
              style={{
                textAlign: p.alignment,
                color: p.textColor,
                fontSize: `${p.fontSize}px`,
                fontWeight: p.bold ? '700' : '400',
                fontStyle: p.italic ? 'italic' : 'normal',
                fontFamily: p.fontFamily || fontFamily,
              }}
            >
              {p.content}
            </p>
          </div>
        );
      }
      case 'image-gallery': {
        const p = block.props as ImageGalleryProps;
        return (
          <div className="p-4 md:p-6" style={{ fontFamily }}>
            <div className={`grid ${gridColsClass(p.columns)} gap-4`}>
              {p.images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-2xl hover:opacity-95 transition" />
              ))}
            </div>
          </div>
        );
      }
      case 'footer': {
        const p = block.props as FooterProps;
        return (
          <footer className="p-4 md:p-6 text-center rounded-2xl" style={{ backgroundColor: p.backgroundColor, color: p.textColor, fontFamily }}>
            <p className="mb-2">{p.text}</p>
            <div className="flex justify-center gap-4">
              {p.links.map((l, i) => (
                <a key={i} href={l.url} className="hover:underline">{l.label}</a>
              ))}
            </div>
          </footer>
        );
      }
      default:
        return <div className="p-4 bg-gray-100 rounded-2xl text-center"><strong>{block.type}</strong></div>;
    }
  };

  if (isPreview) return <div className="mb-6 md:mb-8">{renderPreview()}</div>;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group mb-3 md:mb-4 bg-white border rounded-2xl overflow-hidden shadow-sm transition
        ${isDragging ? 'border-blue-500 shadow-md' : isSelected ? 'border-blue-400 shadow' : 'border-gray-200'}`}
    >
      {/* Drag handle: always visible and bigger on mobile; hover-reveal on desktop */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 left-3 z-20 cursor-grab bg-gray-900 text-white/90 px-4 py-2.5 rounded-lg text-sm font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100 md:px-3 md:py-2 md:text-[13px] transition-all pointer-events-auto"
        title="Drag to move"
      >
        Drag
      </div>
      <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(id); }}
          className="bg-gray-900 text-white p-1.5 rounded-lg hover:bg-gray-800 transition"
          title="Duplicate"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(id); }}
          className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 transition"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div onClick={() => onSelect(id)} className="cursor-pointer">{renderPreview()}</div>
    </div>
  );
}

/* ============================
   Main Editor
============================ */
export default function StoreBuilder() {
  const [layout, setLayout] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [storeName, setStoreName] = useState('My Store');
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [sidebarTab, setSidebarTab] = useState<'blocks'|'props'>('blocks'); // mobile tabs inside 40% drawer
  const [globalFont, setGlobalFont] = useState(FONT_OPTIONS[0].value);
  const [history, setHistory] = useState<Block[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const sensors = useSensors(useSensor(PointerSensor));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedBlock = useMemo(
    () => layout.find((b) => b.id === selectedId) ?? null,
    [layout, selectedId]
  );

  useEffect(() => {
    // Auto switch to props tab on mobile when selecting a block
    if (selectedBlock) setSidebarTab('props');
  }, [selectedBlock]);

  const pushHistory = (newLayout: Block[]) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newLayout];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayout(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayout(history[historyIndex + 1]);
    }
  };

  const addBlock = (type: BlockType) => {
    const tpl = BLOCK_TEMPLATES[type];
    const newBlock: Block = {
      id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      props: JSON.parse(JSON.stringify(tpl.props)),
    };
    const newLayout = [...layout, newBlock];
    setLayout(newLayout);
    pushHistory(newLayout);
    setSelectedId(newBlock.id);
    setSidebarOpen(true);
    setSidebarTab('props');
  };

  const onDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return setActiveId(null);
    if (active.id !== over.id) {
      setLayout((l) => {
        const oldIndex = l.findIndex((b) => b.id === active.id);
        const newIndex = l.findIndex((b) => b.id === over.id);
        const newLayout = arrayMove(l, oldIndex, newIndex);
        pushHistory(newLayout);
        return newLayout;
      });
    }
    setActiveId(null);
  };

  const updateProp = (id: string, key: string, value: any) => {
    setLayout((prev) => {
      const newLayout = prev.map((b) => (b.id === id ? { ...b, props: { ...b.props, [key]: value } } : b));
      pushHistory(newLayout);
      return newLayout;
    });
  };

  const deleteBlock = (id: string) => {
    const newLayout = layout.filter((b) => b.id !== id);
    setLayout(newLayout);
    pushHistory(newLayout);
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateBlock = (id: string) => {
    setLayout((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` };
      const newLayout = [...prev];
      newLayout.splice(idx + 1, 0, copy);
      pushHistory(newLayout);
      return newLayout;
    });
  };

  const saveLayout = () => {
    const data = { storeName, blocks: layout, theme: { font: globalFont }, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storeName.toLowerCase().replace(/\s+/g, '-')}-layout.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadLayout = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target?.result));
        if (data.storeName) setStoreName(data.storeName);
        if (data.theme?.font) setGlobalFont(data.theme.font);
        if (Array.isArray(data.blocks)) {
          setLayout(data.blocks);
          pushHistory(data.blocks);
        }
      } catch {
        alert('Invalid layout file.');
      }
    };
    reader.readAsText(file);
  };

  const renderPropEditor = () => {
    const b = selectedBlock;
    if (!b) return <div className="p-3 text-xs text-gray-500">Select a block to edit.</div>;
    const set = (key: string, v: any) => updateProp(b.id, key, v);

    return (
      <div className="p-3 space-y-2">
        <div className="text-[13px] font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <Settings size={14} />
          <span>Edit {BLOCK_TEMPLATES[b.type].label}</span>
        </div>

        {b.type === 'hero-banner' && (() => {
          const p = b.props as HeroProps;
          return (
            <>
              <Accordion title="Content" defaultOpen>
                <div><Label>Title</Label><TextInput value={p.title} onChange={(v) => set('title', v)} /></div>
                <div><Label>Subtitle</Label><TextInput value={p.subtitle} onChange={(v) => set('subtitle', v)} /></div>
                <div><Label>Background Image URL</Label><TextInput value={p.backgroundImage} onChange={(v) => set('backgroundImage', v)} /></div>
                <div><Label>Button Text</Label><TextInput value={p.buttonText} onChange={(v) => set('buttonText', v)} /></div>
              </Accordion>
              <Accordion title="Colors">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Text</Label><ColorInput value={p.textColor} onChange={(v) => set('textColor', v)} /></div>
                  <div><Label>Button Text</Label><ColorInput value={p.buttonColor} onChange={(v) => set('buttonColor', v)} /></div>
                  <div className="col-span-2"><Label>Button BG</Label><ColorInput value={p.buttonBgColor} onChange={(v) => set('buttonBgColor', v)} /></div>
                </div>
              </Accordion>
            </>
          );
        })()}

        {b.type === 'product-grid' && (() => {
          const p = b.props as ProductGridProps;
          return (
            <>
              <Accordion title="Content" defaultOpen>
                <div><Label>Title</Label><TextInput value={p.title} onChange={(v) => set('title', v)} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>Mobile Columns</Label>
                    <NumberInput value={p.columns.mobile} onChange={(v) => set('columns', { ...p.columns, mobile: Math.min(2, Math.max(1, v)) as 1|2 })} min={1} max={2} />
                  </div>
                  <div>
                    <Label>MD Columns</Label>
                    <NumberInput value={p.columns.md} onChange={(v) => set('columns', { ...p.columns, md: Math.min(3, Math.max(1, v)) as 1|2|3 })} min={1} max={3} />
                  </div>
                  <div>
                    <Label>LG Columns</Label>
                    <NumberInput value={p.columns.lg} onChange={(v) => set('columns', { ...p.columns, lg: Math.min(4, Math.max(1, v)) as 1|2|3|4 })} min={1} max={4} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="mb-0">Show Price</Label>
                    <Toggle value={p.showPrice} onChange={(v) => set('showPrice', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="mb-0">Show Ratings</Label>
                    <Toggle value={p.showRatings} onChange={(v) => set('showRatings', v)} />
                  </div>
                </div>
              </Accordion>
              <Accordion title="Colors">
                <div><Label>Text</Label><ColorInput value={p.textColor} onChange={(v) => set('textColor', v)} /></div>
              </Accordion>
            </>
          );
        })()}

        {b.type === 'cta-banner' && (() => {
          const p = b.props as CtaProps;
          return (
            <>
              <Accordion title="Content" defaultOpen>
                <div><Label>Title</Label><TextInput value={p.title} onChange={(v) => set('title', v)} /></div>
                <div><Label>Subtitle</Label><TextInput value={p.subtitle} onChange={(v) => set('subtitle', v)} /></div>
                <div><Label>Button Text</Label><TextInput value={p.buttonText} onChange={(v) => set('buttonText', v)} /></div>
              </Accordion>
              <Accordion title="Colors">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Background</Label><ColorInput value={p.backgroundColor} onChange={(v) => set('backgroundColor', v)} /></div>
                  <div><Label>Text</Label><ColorInput value={p.textColor} onChange={(v) => set('textColor', v)} /></div>
                  <div><Label>Button Text</Label><ColorInput value={p.buttonColor} onChange={(v) => set('buttonColor', v)} /></div>
                  <div><Label>Button BG</Label><ColorInput value={p.buttonBgColor} onChange={(v) => set('buttonBgColor', v)} /></div>
                </div>
              </Accordion>
            </>
          );
        })()}

        {b.type === 'newsletter' && (() => {
          const p = b.props as NewsletterProps;
          return (
            <>
              <Accordion title="Content" defaultOpen>
                <div><Label>Title</Label><TextInput value={p.title} onChange={(v) => set('title', v)} /></div>
                <div><Label>Subtitle</Label><TextInput value={p.subtitle} onChange={(v) => set('subtitle', v)} /></div>
                <div><Label>Button Text</Label><TextInput value={p.buttonText} onChange={(v) => set('buttonText', v)} /></div>
              </Accordion>
              <Accordion title="Colors">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Background</Label><ColorInput value={p.backgroundColor} onChange={(v) => set('backgroundColor', v)} /></div>
                  <div><Label>Text</Label><ColorInput value={p.textColor} onChange={(v) => set('textColor', v)} /></div>
                  <div className="col-span-2"><Label>Input Background</Label><ColorInput value={p.inputBgColor} onChange={(v) => set('inputBgColor', v)} /></div>
                </div>
              </Accordion>
            </>
          );
        })()}

        {b.type === 'testimonials' && (() => {
          const p = b.props as TestimonialsProps;
          return (
            <>
              <Accordion title="Content" defaultOpen>
                <div><Label>Title</Label><TextInput value={p.title} onChange={(v) => set('title', v)} /></div>
                <div className="space-y-2">
                  {p.testimonials.map((t, idx) => (
                    <RowShell key={idx} onRemove={() => set('testimonials', p.testimonials.filter((_, i) => i !== idx))}>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2"><Label>Name</Label><TextInput value={t.name} onChange={(v) => {
                          const next = [...p.testimonials]; next[idx] = { ...next[idx], name: v }; set('testimonials', next);
                        }} /></div>
                        <div className="col-span-2"><Label>Text</Label><TextInput value={t.text} onChange={(v) => {
                          const next = [...p.testimonials]; next[idx] = { ...next[idx], text: v }; set('testimonials', next);
                        }} /></div>
                        <div><Label>Rating (1–5)</Label><NumberInput value={t.rating} onChange={(v) => {
                          const vv = Math.min(5, Math.max(1, Math.round(v)));
                          const next = [...p.testimonials]; next[idx] = { ...next[idx], rating: vv as Testimonial['rating'] }; set('testimonials', next);
                        }} min={1} max={5} /></div>
                      </div>
                    </RowShell>
                  ))}
                  <button
                    onClick={() => set('testimonials', [...p.testimonials, { name: 'New User', text: 'Great product!', rating: 5 }])}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs hover:bg-gray-50 transition"
                  >
                    <Plus size={14} /> Add testimonial
                  </button>
                </div>
              </Accordion>
              <Accordion title="Colors">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Text</Label><ColorInput value={p.textColor} onChange={(v) => set('textColor', v)} /></div>
                  <div><Label>Background</Label><ColorInput value={p.backgroundColor} onChange={(v) => set('backgroundColor', v)} /></div>
                </div>
              </Accordion>
            </>
          );
        })()}

        {b.type === 'text-block' && (() => {
          const p = b.props as TextBlockProps;
          return (
            <>
              <Accordion title="Content" defaultOpen>
                <div><Label>Text</Label><TextInput value={p.content} onChange={(v) => set('content', v)} /></div>
                <div className="flex items-center justify-between">
                  <Label className="mb-0">Alignment</Label>
                  <Segmented
                    value={p.alignment}
                    onChange={(v) => set('alignment', v)}
                    options={[
                      { value: 'left', icon: <AlignLeft size={14} /> },
                      { value: 'center', icon: <AlignCenter size={14} /> },
                      { value: 'right', icon: <AlignRight size={14} /> },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Font Size (px)</Label><NumberInput value={p.fontSize} onChange={(v) => set('fontSize', Math.max(10, Math.min(72, v)))} min={10} max={72} /></div>
                  <div className="flex items-center justify-between">
                    <Label className="mb-0">Bold</Label>
                    <Toggle value={p.bold} onChange={(v) => set('bold', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="mb-0">Italic</Label>
                    <Toggle value={p.italic} onChange={(v) => set('italic', v)} />
                  </div>
                </div>
              </Accordion>
              <Accordion title="Typography">
                <div>
                  <Label>Font (override)</Label>
                  <select
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    value={p.fontFamily || ''}
                    onChange={(e) => set('fontFamily', e.target.value)}
                  >
                    <option value="">Inherit Global</option>
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </Accordion>
              <Accordion title="Color">
                <div><Label>Text</Label><ColorInput value={p.textColor} onChange={(v) => set('textColor', v)} /></div>
              </Accordion>
            </>
          );
        })()}

        {b.type === 'image-gallery' && (() => {
          const p = b.props as ImageGalleryProps;
          return (
            <>
              <Accordion title="Layout" defaultOpen>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>Mobile Columns</Label>
                    <NumberInput value={p.columns.mobile} onChange={(v) => set('columns', { ...p.columns, mobile: Math.min(2, Math.max(1, v)) as 1|2 })} min={1} max={2} />
                  </div>
                  <div>
                    <Label>MD Columns</Label>
                    <NumberInput value={p.columns.md} onChange={(v) => set('columns', { ...p.columns, md: Math.min(3, Math.max(1, v)) as 1|2|3 })} min={1} max={3} />
                  </div>
                  <div>
                    <Label>LG Columns</Label>
                    <NumberInput value={p.columns.lg} onChange={(v) => set('columns', { ...p.columns, lg: Math.min(4, Math.max(1, v)) as 1|2|3|4 })} min={1} max={4} />
                  </div>
                </div>
              </Accordion>
              <Accordion title="Images">
                <div className="space-y-2">
                  {p.images.map((url, idx) => (
                    <RowShell key={idx} onRemove={() => set('images', p.images.filter((_, i) => i !== idx))}>
                      <div className="flex items-center gap-2">
                        <img src={url} alt="" className="h-12 w-12 object-cover rounded-lg border" />
                        <div className="flex-1">
                          <Label>URL</Label>
                          <TextInput value={url} onChange={(v) => {
                            const next = [...p.images]; next[idx] = v; set('images', next);
                          }} />
                        </div>
                      </div>
                    </RowShell>
                  ))}
                  <button
                    onClick={() => set('images', [...p.images, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900'])}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs hover:bg-gray-50 transition"
                  >
                    <Plus size={14} /> Add image
                  </button>
                </div>
              </Accordion>
            </>
          );
        })()}

        {b.type === 'footer' && (() => {
          const p = b.props as FooterProps;
          return (
            <>
              <Accordion title="Content" defaultOpen>
                <div><Label>Text</Label><TextInput value={p.text} onChange={(v) => set('text', v)} /></div>
                <div className="space-y-2">
                  {p.links.map((lnk, idx) => (
                    <RowShell key={idx} onRemove={() => set('links', p.links.filter((_, i) => i !== idx))}>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label>Label</Label><TextInput value={lnk.label} onChange={(v) => {
                          const next = [...p.links]; next[idx] = { ...next[idx], label: v }; set('links', next);
                        }} /></div>
                        <div><Label>URL</Label><TextInput value={lnk.url} onChange={(v) => {
                          const next = [...p.links]; next[idx] = { ...next[idx], url: v }; set('links', next);
                        }} /></div>
                      </div>
                    </RowShell>
                  ))}
                  <button
                    onClick={() => set('links', [...p.links, { label: 'New Link', url: '#' }])}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs hover:bg-gray-50 transition"
                  >
                    <Plus size={14} /> Add link
                  </button>
                </div>
              </Accordion>
              <Accordion title="Colors">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Text</Label><ColorInput value={p.textColor} onChange={(v) => set('textColor', v)} /></div>
                  <div><Label>Background</Label><ColorInput value={p.backgroundColor} onChange={(v) => set('backgroundColor', v)} /></div>
                </div>
              </Accordion>
            </>
          );
        })()}
      </div>
    );
  };

  /* UI */
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-gray-100 flex flex-col" style={{ fontFamily: globalFont }}>
      {/* Toolbar */}
      <div className="bg-white/80 backdrop-blur border-b px-3 py-2 md:px-6 sticky top-0 z-30">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="md:hidden inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border text-sm bg-white hover:bg-gray-50 transition"
              title="Toggle Editor"
            >
              <SlidersHorizontal size={16} />
              Editor
            </button>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="text-base md:text-lg font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition-colors min-w-[140px]"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Global Font select */}
            <div className="hidden sm:flex items-center gap-2">
              <Type size={16} className="text-gray-600" />
              <select
                className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={globalFont}
                onChange={(e) => setGlobalFont(e.target.value)}
                title="Global font"
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-2 rounded-lg ${viewportMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Desktop View"
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-2 rounded-lg ${viewportMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Mobile View"
              >
                <Smartphone size={16} />
              </button>
            </div>

            <button
              onClick={() => setIsPreviewMode((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isPreviewMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
              title="Toggle Preview"
            >
              <Eye size={14} />
              {isPreviewMode ? 'Exit Preview' : 'Preview'}
            </button>

            <div className="flex gap-1">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo size={16} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo size={16} />
              </button>
            </div>

            <label className="inline-flex">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => e.target.files?.[0] && loadLayout(e.target.files[0])}
                className="hidden"
              />
              <span className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg hover:bg-gray-50 text-gray-800 cursor-pointer transition">
                <Download size={14} /> Load
              </span>
            </label>
            <button
              onClick={saveLayout}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Save size={14} />
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar / Drawer (mobile 40% width) */}
        <aside
          className={`fixed md:static z-40 md:z-auto top-0 right-0 h-full md:h-auto w-[40vw] min-w-[260px] max-w-full bg-white shadow-2xl md:shadow-none border-l md:border-r md:border-b-0 transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
          aria-hidden={!sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768}
        >
          {/* Mobile header inside drawer */}
          <div className="md:hidden flex items-center justify-between px-3 py-2 border-b bg-white sticky top-0">
            <div className="flex items-center gap-2">
              <Save size={16} className="text-gray-600" />
              <span className="text-sm font-semibold">Editor</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-gray-100" title="Close">
              <X size={18} />
            </button>
          </div>

          {!isPreviewMode && (
            <div className="h-full flex flex-col">
              {/* Mobile tabs to improvise space in 40% drawer */}
              <div className="md:hidden px-3 py-2 border-b bg-white sticky top-[41px]">
                <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-0.5">
                  <button
                    className={`px-3 py-1.5 text-sm rounded-xl ${sidebarTab === 'blocks' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setSidebarTab('blocks')}
                  >
                    Blocks
                  </button>
                  <button
                    className={`px-3 py-1.5 text-sm rounded-xl ${sidebarTab === 'props' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setSidebarTab('props')}
                  >
                    Properties
                  </button>
                </div>
              </div>

              {/* Blocks palette */}
              <div className={`p-3 border-b md:block ${sidebarTab === 'blocks' ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Add Blocks</h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(BLOCK_TEMPLATES).map(([t, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={t}
                        onClick={() => addBlock(t as BlockType)}
                        className="flex flex-col items-center gap-1 p-2 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition"
                        title={`Add ${cfg.label}`}
                      >
                        <Icon size={18} className="text-gray-600" />
                        <span className="text-[10px] text-gray-700">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Properties */}
              <div className={`p-3 overflow-y-auto [height:calc(100%-56px)] md:max-h-[calc(100vh-64px)] ${sidebarTab === 'props' ? 'block' : 'hidden md:block'}`}>
                <div className="hidden md:flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-700">Block Properties</h3>
                </div>
                {renderPropEditor()}
              </div>
            </div>
          )}
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto">
          <div className={`mx-auto ${viewportMode === 'mobile' ? 'max-w-sm' : 'max-w-6xl'} w-full p-3 md:p-6`}>
            {layout.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <h2 className="text-lg md:text-2xl font-bold mb-1">Start Building Your Store</h2>
                <p className="text-sm">Tap “Editor” to add blocks</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <SortableContext items={layout.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  {layout.map((b) => (
                    <SortableBlockCard
                      key={b.id}
                      id={b.id}
                      block={b}
                      onSelect={(id) => { setSelectedId(id); setSidebarOpen(true); setSidebarTab('props'); }}
                      onDelete={deleteBlock}
                      onDuplicate={duplicateBlock}
                      isSelected={selectedId === b.id}
                      isPreview={isPreviewMode}
                      globalFont={globalFont}
                    />
                  ))}
                </SortableContext>

                {/* Tiny drag overlay chip */}
                <DragOverlay>
                  {activeId ? (
                    <div className="px-2 py-1 text-xs rounded-lg bg-black text-white shadow-lg">
                      {(() => {
                        const b = layout.find(x => x.id === activeId);
                        if (!b) return 'Moving';
                        return BLOCK_TEMPLATES[b.type]?.label ?? b.type;
                      })()}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}