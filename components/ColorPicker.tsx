/**
 * Color Picker - Select accent color for theme
 */

'use client';

import { CheckIcon } from '@heroicons/react/24/outline';

interface ColorPickerProps {
  colors: Array<{ name: string; value: string }>;
  selected: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ colors, selected, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className="group relative"
          title={color.name}
        >
          <div
            className={`w-full aspect-square rounded-lg transition-all duration-200 ${
              selected === color.value
                ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100 scale-110'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: color.value }}
          >
            {selected === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            )}
          </div>
          <p className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
            {color.name}
          </p>
        </button>
      ))}
    </div>
  );
}
