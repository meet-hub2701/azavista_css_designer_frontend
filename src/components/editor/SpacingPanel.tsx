'use client';

import type { SpacingStyles } from '../../../../shared/src/types';

interface Props {
  spacing: SpacingStyles;
  onChange: (spacing: SpacingStyles) => void;
}

export default function SpacingPanel({ spacing, onChange }: Props) {
  const updateSpacing = (field: keyof SpacingStyles, value: number) => {
    onChange({ ...spacing, [field]: value });
  };

  return (
    <div className="space-y-4">
      {Object.entries(spacing).map(([key, value]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => updateSpacing(key as keyof SpacingStyles, parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={value}
              onChange={(e) => updateSpacing(key as keyof SpacingStyles, parseInt(e.target.value))}
              className="w-20 px-2 py-1 border rounded text-right"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>
        </div>
      ))}
    </div>
  );
}
