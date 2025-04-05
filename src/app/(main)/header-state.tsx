'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface CategoryTypeSelectorProps {
  initialType?: string;
  onTypeChange: (type: string) => void;
  className?: string;
}

const categoryTypes = [
  { id: 'gamelainnya', label: 'Games' },
  { id: 'pulsa', label: 'Pulsa' },
  { id: 'voucher', label: 'Voucher' },
  { id: 'PLN', label: 'Pln' },
] as const;

export function CategoryTypeSelector({
  initialType = 'gamelainnya',
  onTypeChange,
  className = '',
}: CategoryTypeSelectorProps) {
  const [categoryType, setCategoryType] = useState(initialType);

  const handleTypeChange = useCallback((type: string) => {
    setCategoryType(type);
    onTypeChange(type);
  }, [onTypeChange]);

  useEffect(() => {
    if (initialType !== categoryType) {
      setCategoryType(initialType);
    }
  }, [initialType]);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categoryTypes.map((type) => {
        const isActive = categoryType === type.id;
        
        return (
          <motion.button
            key={type.id}
            onClick={() => handleTypeChange(type.id)}
            whileHover={!isActive ? { scale: 1.05 } : {}}
            whileTap={!isActive ? { scale: 0.98 } : {}}
            className={`group relative overflow-hidden rounded-full font-medium text-sm transition-all duration-300
              py-2.5 px-6 shadow-sm border ${
                isActive
                  ? 'border-orange-500 text-white'
                  : 'border-orange-200 text-orange-600 hover:border-orange-300 hover:text-orange-700 bg-white'
              }`}
          >
            {/* Animated background */}
            {isActive && (
              <motion.span
                layoutId="activeBackground"
                className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Text content */}
            <span className="relative z-10 flex items-center gap-1.5">
              {type.label}
            </span>

            {/* Active indicator - animated ring */}
            {isActive && (
              <motion.span
                layoutId="activeIndicator"
                className="absolute inset-0 border-2 border-orange-300 rounded-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            )}

            {/* Subtle shine effect */}
            <span
              className={`absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-white/30 ${
                isActive ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
              } transition-opacity duration-300`}
              style={{
                transform: isActive ? 'translateX(0)' : 'translateX(-100%)',
              }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}