'use client';

import type { TypographyStyles } from '../../../../shared/src/types';

interface Props {
  typography: TypographyStyles;
  onChange: (typography: TypographyStyles) => void;
}

const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Inter', 'Roboto'];
const fontWeights = ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold'];

export default function TypographyPanel({ typography, onChange }: Props) {
  const updateTypography = (element: keyof TypographyStyles, field: string, value: any) => {
    onChange({
      ...typography,
      [element]: {
        ...typography[element],
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {(['h1', 'h2', 'h3', 'body'] as const).map((element) => (
        <div key={element} className="space-y-3 pb-4 border-b last:border-b-0">
          <h4 className="font-semibold text-sm uppercase text-gray-700">
            {element === 'body' ? 'Body Text' : element.toUpperCase()}
          </h4>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Font Family</label>
            <select
              value={typography[element].fontFamily}
              onChange={(e) => updateTypography(element, 'fontFamily', e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              {fonts.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Size (px)</label>
              <input
                type="number"
                value={typography[element].fontSize}
                onChange={(e) => updateTypography(element, 'fontSize', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Weight</label>
              <select
                value={typography[element].fontWeight}
                onChange={(e) => updateTypography(element, 'fontWeight', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded"
              >
                {fontWeights.map((weight) => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
            <input
              type="color"
              value={typography[element].color}
              onChange={(e) => updateTypography(element, 'color', e.target.value)}
              className="w-full h-8 border rounded"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
