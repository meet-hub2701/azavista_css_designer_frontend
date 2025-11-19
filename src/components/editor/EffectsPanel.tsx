'use client';

import type { EffectStyles } from '../../../../shared/src/types';

interface Props {
  effects: EffectStyles;
  onChange: (effects: EffectStyles) => void;
}

export default function EffectsPanel({ effects, onChange }: Props) {
  const updateEffects = (field: keyof EffectStyles, value: any) => {
    onChange({ ...effects, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Shadow</label>
        <input
          type="text"
          value={effects.cardShadow}
          onChange={(e) => updateEffects('cardShadow', e.target.value)}
          placeholder="0 4px 6px rgba(0,0,0,0.1)"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Button Shadow</label>
        <input
          type="text"
          value={effects.buttonShadow}
          onChange={(e) => updateEffects('buttonShadow', e.target.value)}
          placeholder="0 2px 4px rgba(0,0,0,0.1)"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hover Transform</label>
        <input
          type="text"
          value={effects.hoverTransform}
          onChange={(e) => updateEffects('hoverTransform', e.target.value)}
          placeholder="translateY(-2px)"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Transition Duration (ms)</label>
        <input
          type="number"
          value={effects.transitionDuration}
          onChange={(e) => updateEffects('transitionDuration', parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>
    </div>
  );
}
