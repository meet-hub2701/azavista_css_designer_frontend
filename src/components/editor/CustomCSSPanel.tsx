'use client';

interface Props {
  customCSS: string;
  onChange: (customCSS: string) => void;
}

export default function CustomCSSPanel({ customCSS, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Add your own custom CSS rules</p>
      <textarea
        value={customCSS}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/* Your custom CSS here */&#10;.my-class {&#10;  color: red;&#10;}"
        rows={10}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono text-sm"
      />
    </div>
  );
}
