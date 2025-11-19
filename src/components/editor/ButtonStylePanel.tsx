'use client';

import { useState } from 'react';
import type { ButtonStyles } from '../../../../shared/src/types';

interface Props {
  buttons: ButtonStyles;
  onChange: (buttons: ButtonStyles) => void;
}

const colorPresets = ['#ef4444', '#22c55e', '#000000', '#ffffff', '#3b82f6'];
const fontWeights = ['Thin', 'ExtraLight', 'Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold', 'Black'];
const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New'];

export default function ButtonStylePanel({ buttons, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary');
  const currentButton = buttons[activeTab];

  const updateButton = (field: string, value: any) => {
    onChange({
      ...buttons,
      [activeTab]: {
        ...currentButton,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('primary')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'primary'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          PRIMARY
        </button>
        <button
          onClick={() => setActiveTab('secondary')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'secondary'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          SECONDARY
        </button>
      </div>

      {/* Preview Button */}
      <div className="flex justify-center p-4 bg-gray-50 rounded">
        <button
          style={{
            backgroundColor: currentButton.backgroundColor,
            color: currentButton.textColor,
            borderRadius: `${currentButton.borderRadius}px`,
            border: `${currentButton.borderWidth}px solid ${currentButton.borderColor}`,
            fontSize: `${currentButton.fontSize}px`,
            fontWeight: currentButton.fontWeight,
            fontFamily: currentButton.fontFamily,
            padding: `${currentButton.paddingY}px ${currentButton.paddingX}px`,
          }}
        >
          Save & Publish
        </button>
      </div>

      {/* Button Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Button Type</label>
        <select
          value={currentButton.type}
          onChange={(e) => updateButton('type', e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          <option value="contained">contained</option>
          <option value="outlined">outlined</option>
          <option value="text">text</option>
        </select>
      </div>

      {/* Corner Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Corner Radius</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="50"
            value={currentButton.borderRadius}
            onChange={(e) => updateButton('borderRadius', parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={currentButton.borderRadius}
            onChange={(e) => updateButton('borderRadius', parseInt(e.target.value))}
            className="w-20 px-2 py-1 border rounded text-right"
          />
          <span className="text-sm text-gray-500">px</span>
        </div>
      </div>

      {/* Button Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select button color</label>
        <div className="flex gap-2">
          {colorPresets.map((color) => (
            <button
              key={color}
              onClick={() => updateButton('backgroundColor', color)}
              className={`w-10 h-10 rounded-full border-2 ${
                currentButton.backgroundColor === color ? 'border-blue-600' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <button
            onClick={() => {
              const color = prompt('Enter hex color:', currentButton.backgroundColor);
              if (color) updateButton('backgroundColor', color);
            }}
            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500"
          >
            +
          </button>
        </div>
      </div>

      {/* Border Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Border Width</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="10"
            value={currentButton.borderWidth}
            onChange={(e) => updateButton('borderWidth', parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={currentButton.borderWidth}
            onChange={(e) => updateButton('borderWidth', parseInt(e.target.value))}
            className="w-20 px-2 py-1 border rounded text-right"
          />
          <span className="text-sm text-gray-500">px</span>
        </div>
      </div>

      {/* Border Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select border color</label>
        <div className="flex gap-2">
          {colorPresets.map((color) => (
            <button
              key={color}
              onClick={() => updateButton('borderColor', color)}
              className={`w-10 h-10 rounded-full border-2 ${
                currentButton.borderColor === color ? 'border-blue-600' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Font */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font</label>
        <select
          value={currentButton.fontFamily}
          onChange={(e) => updateButton('fontFamily', e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          {fonts.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      {/* Font Size & Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
          <select
            value={currentButton.fontSize}
            onChange={(e) => updateButton('fontSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            {[12, 14, 16, 18, 20, 24].map((size) => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
          <select
            value={currentButton.fontWeight}
            onChange={(e) => updateButton('fontWeight', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            {fontWeights.map((weight) => (
              <option key={weight} value={weight}>{weight}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
