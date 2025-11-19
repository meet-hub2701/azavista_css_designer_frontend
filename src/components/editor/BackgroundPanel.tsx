'use client';

import type { BackgroundStyles } from '../../../../shared/src/types';

interface Props {
  background: BackgroundStyles;
  onChange: (background: BackgroundStyles) => void;
}

export default function BackgroundPanel({ background, onChange }: Props) {
  const updateBackground = (field: keyof BackgroundStyles, value: any) => {
    onChange({ ...background, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Body Background</label>
        <input
          type="color"
          value={background.bodyBackground}
          onChange={(e) => updateBackground('bodyBackground', e.target.value)}
          className="w-full h-10 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Background</label>
        <input
          type="color"
          value={background.sectionBackground}
          onChange={(e) => updateBackground('sectionBackground', e.target.value)}
          className="w-full h-10 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Background</label>
        <input
          type="color"
          value={background.cardBackground}
          onChange={(e) => updateBackground('cardBackground', e.target.value)}
          className="w-full h-10 border rounded"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={background.useGradient}
          onChange={(e) => updateBackground('useGradient', e.target.checked)}
          className="w-4 h-4"
        />
        <label className="text-sm font-medium text-gray-700">Use Gradient</label>
      </div>
    </div>
  );
}
