import React, { useEffect, useState, useRef } from 'react';
import { X, ExternalLink, TrendingUp, Package, Truck, CreditCard, Palette, Link, Calendar, Mail, Phone, MapPin, Image as ImageIcon, ChevronDown } from 'lucide-react';
import type { Store } from '../layout/storeManagement';

const CustomDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}> = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs text-black hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500 truncate"
      >
        <span className="truncate">{options.find(opt => opt.value === value)?.label || label}</span>
        <ChevronDown className="h-3 w-3 text-gray-600 flex-shrink-0 ml-1" />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="block w-full px-2 py-1 text-xs text-black hover:bg-green-50 text-left truncate"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface Field {
  label: string;
  key: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'checkbox' | 'select' | 'color' | 'image' | 'readonly' | 'list';
  value?: string | number;
  readonly?: boolean;
  options?: { value: string; label: string }[];
  items?: string[];
}

interface Section {
  title: string;
  icon: React.ReactNode;
  fields: (Field | Field[])[];
  index: number;
}

const StoreModal: React.FC<{
  store: Store | null;
  onClose: () => void;
  onSave: (updatedStore: Store) => void;
}> = ({ store, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Store> | null>(store);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    setFormData(store ? { ...store } : null);
  }, [store]);

  if (!store || !formData) return null;

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleChange = (field: keyof Store, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value } as Partial<Store>));
  };

  const handleNestedChange = (parent: keyof Store, child: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev as any)?.[parent], [child]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && store) {
      onSave({ ...store, ...formData } as Store);
    }
  };

  const getCurrentValue = (key: string): string | number | boolean | undefined => {
    const isNested = key.includes('.');
    if (!isNested) {
      return (formData as any)[key];
    }
    const [parentKey, childKey] = key.split('.');
    const parent = parentKey as keyof Store;
    return (formData as any)?.[parent]?.[childKey];
  };

  const renderSection = (section: Section) => {
    const isActive = activeSection === section.index;
    if (!isActive) return null;
    return (
      <div key={section.index} className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          {section.icon}
          <span className="ml-2">{section.title}</span>
        </h4>
        <div className="space-y-3">
          {section.fields.map((field, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.isArray(field) ? (
                field.map(subField => (
                  <div key={subField.key} className="sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">{subField.label}</label>
                    {renderField(subField)}
                  </div>
                ))
              ) : (
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                  {renderField(field)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderField = (field: Field) => {
    const { key, type, readonly = false, options, items } = field;
    let currentValue = getCurrentValue(key);
    if (field.value !== undefined) {
      currentValue = field.value;
    }

    const isNested = key.includes('.');
    const [parentKey, childKey] = isNested ? key.split('.') : [null, null];
    const parent = parentKey as keyof Store;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | any) => {
      const newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      if (isNested && parent && childKey) {
        handleNestedChange(parent, childKey, newValue);
      } else {
        handleChange(key as keyof Store, newValue);
      }
    };

    const handleSelectChange = (newValue: string) => {
      if (isNested && parent && childKey) {
        handleNestedChange(parent, childKey, newValue);
      } else {
        handleChange(key as keyof Store, newValue);
      }
    };

    if (type === 'readonly') {
      return <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">{currentValue || 'N/A'}</p>;
    }

    if (type === 'list') {
      return (
        <div className="bg-gray-50 p-2 rounded">
          <ul className="text-xs space-y-1 max-h-20 overflow-y-auto">
            {items?.length ? (
              items.map((item: string, i: number) => <li key={i}>{item}</li>)
            ) : (
              <li className="text-gray-400 italic">None</li>
            )}
          </ul>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          value={String(currentValue || '')}
          onChange={handleInputChange}
          readOnly={readonly}
          rows={2}
          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-xs text-black resize-none"
        />
      );
    }

    if (type === 'select') {
      return (
        <CustomDropdown
          value={String(currentValue || '')}
          onChange={handleSelectChange}
          options={options || []}
          label={field.label}
        />
      );
    }

    if (type === 'color') {
      return <input type="color" value={String(currentValue || '#000000')} onChange={handleInputChange} className="w-full h-8 border rounded" />;
    }

    if (type === 'image') {
      return (
        <div className="space-y-2">
          <img 
            src={String(currentValue || '')} 
            alt={field.label} 
            className="w-20 h-20 object-cover rounded border" 
            onError={(e) => { 
              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
            }} 
          />
          {!readonly && (
            <input
              type="url"
              value={String(currentValue || '')}
              onChange={handleInputChange}
              placeholder="Enter image URL"
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-black"
            />
          )}
        </div>
      );
    }

    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={!!currentValue}
          onChange={handleInputChange}
          disabled={readonly}
          className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
      );
    }

    return (
      <input
        type={type}
        value={String(currentValue || '')}
        onChange={handleInputChange}
        readOnly={readonly}
        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-xs text-black"
      />
    );
  };

  const sections: Section[] = [
    {
      title: 'Basic Information',
      icon: <Calendar className="h-4 w-4" />,
      fields: [
        { label: 'Store Name', key: 'name', type: 'text' },
        { label: 'Description', key: 'description', type: 'textarea' },
        { label: 'Slug', key: 'slug', type: 'text' },
        { label: 'Currency', key: 'currency', type: 'text' },
        { label: 'Domain', key: 'domain', type: 'text' },
        [
          { label: 'Published', key: 'isPublished', type: 'checkbox' },
          { label: 'Available', key: 'isAvailable', type: 'checkbox' }
        ],
      ],
      index: 0,
    },
    {
      title: 'Contact Details',
      icon: <Mail className="h-4 w-4" />,
      fields: [
        { label: 'Email', key: 'contact.email', type: 'email' },
        { label: 'Phone', key: 'contact.phone', type: 'tel' },
        { label: 'Address', key: 'contact.address', type: 'text' },
      ],
      index: 1,
    },
    {
      title: 'Analytics',
      icon: <TrendingUp className="h-4 w-4" />,
      fields: [
        { label: 'Total Views', key: 'analytics.totalViews', type: 'readonly', value: formData.analytics?.totalViews || 0 },
        { label: 'Views This Week', key: 'analytics.viewsThisWeek', type: 'readonly', value: formData.analytics?.viewsThisWeek || 0 },
        { label: 'Views Today', key: 'analytics.viewsToday', type: 'readonly', value: formData.analytics?.viewsToday || 0 },
        { label: 'Last Reset', key: 'analytics.lastReset', type: 'readonly', value: formData.analytics?.lastReset ? formatDate(formData.analytics.lastReset) : 'N/A' },
      ],
      index: 2,
    },
    {
      title: 'Products',
      icon: <Package className="h-4 w-4" />,
      fields: [
        { label: 'Products Count', key: 'products.length', type: 'readonly', value: (formData.products as any[] | undefined)?.length || 0 },
        { label: 'Products', key: 'products', type: 'list', items: (formData.products as any[] | undefined)?.map((p: any) => p.name || 'Unnamed') || [] },
      ],
      index: 3,
    },
    {
      title: 'Orders',
      icon: <Package className="h-4 w-4" />,
      fields: [
        { label: 'Orders Count', key: 'orders.length', type: 'readonly', value: (formData.orders as string[] | undefined)?.length || 0 },
        { label: 'Recent Orders', key: 'orders', type: 'list', items: (formData.orders as string[] | undefined)?.slice(0, 5).map(id => id.slice(-6)) || [] },
      ],
      index: 4,
    },
    {
      title: 'Shipping & Pickup',
      icon: <Truck className="h-4 w-4" />,
      fields: [
        { label: 'Shipping Enabled', key: 'shipping.enabled', type: 'checkbox' },
        { label: 'Pickup Enabled', key: 'pickup.enabled', type: 'checkbox' },
        { label: 'Pickup Note', key: 'pickup.note', type: 'text' },
        { label: 'Shipping Locations', key: 'shipping.locations', type: 'list', items: (formData.shipping as any)?.locations?.map((loc: any) => `${loc.city || 'N/A'}, ${loc.country || 'N/A'}`) || [] },
      ],
      index: 5,
    },
    {
      title: 'Policies',
      icon: <CreditCard className="h-4 w-4" />,
      fields: [
        { label: 'Returns Policy', key: 'policies.returns', type: 'textarea' },
        { label: 'Terms & Conditions', key: 'policies.terms', type: 'textarea' },
      ],
      index: 6,
    },
    {
      title: 'Design & Branding',
      icon: <Palette className="h-4 w-4" />,
      fields: [
        { label: 'Logo', key: 'logo', type: 'image' },
        { label: 'Hero Image', key: 'heroImage', type: 'image' },
        [
          { label: 'Primary Color', key: 'primaryColor', type: 'color' },
          { label: 'Secondary Color', key: 'secondaryColor', type: 'color' }
        ],
        { label: 'Font', key: 'font', type: 'text' },
        { label: 'Template', key: 'template', type: 'select', options: [{ value: 'sleek', label: 'Sleek' }, { value: 'modern', label: 'Modern' }, { value: 'classic', label: 'Classic' }] },
      ],
      index: 7,
    },
    {
      title: 'Social Links',
      icon: <Link className="h-4 w-4" />,
      fields: [
        [
          { label: 'Instagram', key: 'socialLinks.instagram', type: 'url' },
          { label: 'Facebook', key: 'socialLinks.facebook', type: 'url' }
        ],
        [
          { label: 'Twitter', key: 'socialLinks.twitter', type: 'url' },
          { label: 'TikTok', key: 'socialLinks.tiktok', type: 'url' }
        ],
      ],
      index: 8,
    },
    {
      title: 'Other Details',
      icon: <Calendar className="h-4 w-4" />,
      fields: [
        { label: 'Created At', key: 'createdAt', type: 'readonly', value: formatDate(formData.createdAt || '') },
        { label: 'Updated At', key: 'updatedAt', type: 'readonly', value: formatDate(formData.updatedAt || '') },
        { label: 'Owner ID', key: 'owner', type: 'readonly', value: String(formData.owner || '').slice(-6) || 'N/A' },
      ],
      index: 9,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
          <h3 className="text-lg font-bold text-gray-900">Store Details: {store.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-4 -mx-2 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.index}
              onClick={() => setActiveSection(section.index)}
              className={`px-4 py-2 rounded-lg text-xs font-medium mx-1 flex-shrink-0 ${
                activeSection === section.index
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {sections.map(renderSection)}

          <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg mt-4">
            <a
              href={`https://${(formData.domain || formData.slug || 'zeevo')}.zeevo.shop`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Store
            </a>
          </div>

          <div className="mt-6 flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreModal;