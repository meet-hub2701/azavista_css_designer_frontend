'use client';

import type { BorderStyles } from '../../../../shared/src/types';

interface Props {
  borders: BorderStyles;
  onChange: (borders: BorderStyles) => void;
}

export default function BordersPanel({ borders, onChange }: Props) {
  const updateBorders = (field: keyof BorderStyles, value: any) => {
    onChange({ ...borders, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 pb-4 border-b">
        <h4 className="font-semibold text-sm">Card Borders</h4>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Border Radius (px)</label>
          <input
            type="number"
            value={borders.cardBorderRadius}
            onChange={(e) => updateBorders('cardBorderRadius', parseInt(e.target.value))}
            className="w-full px-2 py-1 border rounded"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Border Width (px)</label>
          <input
            type="number"
            value={borders.cardBorderWidth}
            onChange={(e) => updateBorders('cardBorderWidth', parseInt(e.target.value))}
            className="w-full px-2 py-1 border rounded"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Border Color</label>
          <input
            type="color"
            value={borders.cardBorderColor}
            onChange={(e) => updateBorders('cardBorderColor', e.target.value)}
            className="w-full h-8 border rounded"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Input Borders</h4>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Border Radius (px)</label>
          <input
            type="number"
            value={borders.inputBorderRadius}
            onChange={(e) => updateBorders('inputBorderRadius', parseInt(e.target.value))}
            className="w-full px-2 py-1 border rounded"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Border Width (px)</label>
          <input
            type="number"
            value={borders.inputBorderWidth}
            onChange={(e) => updateBorders('inputBorderWidth', parseInt(e.target.value))}
            className="w-full px-2 py-1 border rounded"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Border Color</label>
          <input
            type="color"
            value={borders.inputBorderColor}
            onChange={(e) => updateBorders('inputBorderColor', e.target.value)}
            className="w-full h-8 border rounded"
          />
        </div>
      </div>
    </div>
  );
}
