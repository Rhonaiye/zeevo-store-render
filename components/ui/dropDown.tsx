import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FC, useState, useEffect, useRef } from 'react';

interface CustomDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CustomDropdown: FC<CustomDropdownProps> = ({ label, value, options, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Get button position when opening
      if (buttonRef.current) {
        setButtonRect(buttonRef.current.getBoundingClientRect());
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        <div className="relative">
          <motion.button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
            }`}
            aria-expanded={isOpen}
            aria-label={`Select ${label}`}
            disabled={disabled}
          >
            <span className="truncate text-black">
              {options.find((opt) => opt.value === value)?.label || value}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && buttonRect && (
          <div className="fixed inset-0 z-[9999]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0"
            />
            
            {/* Dropdown positioned relative to button */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto min-w-[200px]"
              style={{
                left: buttonRect.left,
                top: buttonRect.bottom + 4,
                width: buttonRect.width,
              }}
            >
              {options.map((option) => (
                <motion.div
                  key={option.value}
                  whileHover={{ backgroundColor: '#F3F4F6' }}
                  onClick={() => handleSelect(option.value)}
                  className={`px-3 py-2 text-sm cursor-pointer text-gray-900 first:rounded-t-md last:rounded-b-md ${
                    value === option.value ? 'bg-indigo-50 text-indigo-600 font-medium' : 'hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.label}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomDropdown;