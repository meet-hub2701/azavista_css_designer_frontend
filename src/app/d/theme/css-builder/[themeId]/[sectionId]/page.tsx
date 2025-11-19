'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, RotateCcw, Download, Monitor, Tablet, Smartphone, RefreshCw, Eye } from 'lucide-react';
import { useTheme } from '@/hooks/useThemes';
import { useSection, useUpdateSection } from '@/hooks/useSections';
import Sidebar from '@/components/layout/Sidebar';
import { HexColorPicker } from 'react-colorful';

export default function CSSBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const themeId = params.themeId as string;
  const sectionId = params.sectionId as string;
  
  const { data: themeData } = useTheme(themeId);
  const { data: section, isLoading } = useSection(sectionId);
  const updateSection = useUpdateSection();
  
  // Extract theme from response (could be nested or direct)
  const theme = (themeData as any)?.theme || themeData;
  
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [cssProps, setCssProps] = useState(section?.cssProperties);
  const [customCSS, setCustomCSS] = useState(section?.customCSS || '');
  const [previewKey, setPreviewKey] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (section) {
      setCssProps(section.cssProperties);
      setCustomCSS(section.customCSS || '');
    }
  }, [section]);

  const handleSave = async () => {
    if (!cssProps) return;
    
    try {
      await updateSection.mutateAsync({
        id: sectionId,
        data: {
          cssProperties: cssProps,
          customCSS,
        },
      });
      alert('Section saved successfully!');
    } catch (error) {
      alert('Failed to save section');
    }
  };

  const handleReset = () => {
    if (!confirm('Reset to original values?')) return;
    if (section) {
      setCssProps(section.cssProperties);
      setCustomCSS(section.customCSS || '');
    }
  };

  const generateCSS = () => {
    if (!cssProps || !section) return '';
    
    return `
/* Section: ${section.name} */
.${section.type}-section {
  /* Colors */
  background-color: ${cssProps.colors.background};
  color: ${cssProps.colors.text};
  border-color: ${cssProps.colors.border};
  
  /* Typography */
  font-size: ${cssProps.typography.fontSize};
  font-weight: ${cssProps.typography.fontWeight};
  line-height: ${cssProps.typography.lineHeight};
  letter-spacing: ${cssProps.typography.letterSpacing};
  
  /* Spacing */
  padding: ${cssProps.spacing.padding};
  margin: ${cssProps.spacing.margin};
  gap: ${cssProps.spacing.gap};
  
  /* Borders */
  border-radius: ${cssProps.borders.radius};
  border-width: ${cssProps.borders.width};
  border-style: ${cssProps.borders.style};
  
  /* Effects */
  box-shadow: ${cssProps.effects.shadow};
  transition: ${cssProps.effects.transition};
}

.${section.type}-section:hover {
  background-color: ${cssProps.colors.hover};
  ${cssProps.effects.transform ? `transform: ${cssProps.effects.transform};` : ''}
}

${customCSS}
`.trim();
  };

  const handleExportCSS = () => {
    const css = generateCSS();
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${section?.name.replace(/\s+/g, '-').toLowerCase()}.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const exportData = {
      theme: theme?.name,
      section: section?.name,
      type: section?.type,
      cssProperties: cssProps,
      customCSS,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${section?.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateBootstrapCSS = () => {
    if (!cssProps) return '';
    
    // Generate universal CSS that targets ALL elements
    return `
      /* Universal styles - applies to everything */
      * {
        font-family: ${cssProps.typography.fontFamily || 'inherit'} !important;
      }
      
      /* All buttons */
      button, .btn, .button, input[type="button"], input[type="submit"], a.btn {
        background-color: ${cssProps.colors.background} !important;
        color: ${cssProps.colors.text} !important;
        border: ${cssProps.borders.width} ${cssProps.borders.style} ${cssProps.colors.border} !important;
        border-radius: ${cssProps.borders.radius} !important;
        padding: ${cssProps.spacing.padding} !important;
        font-size: ${cssProps.typography.fontSize} !important;
        font-weight: ${cssProps.typography.fontWeight} !important;
        box-shadow: ${cssProps.effects.shadow} !important;
        transition: ${cssProps.effects.transition} !important;
      }
      
      button:hover, .btn:hover, .button:hover {
        background-color: ${cssProps.colors.hover} !important;
      }
      
      /* All cards and boxes */
      .card, .box, .panel, article, section {
        border: ${cssProps.borders.width} ${cssProps.borders.style} ${cssProps.colors.border} !important;
        border-radius: ${cssProps.borders.radius} !important;
        box-shadow: ${cssProps.effects.shadow} !important;
      }
      
      /* All forms */
      input, textarea, select, .form-control, .input {
        border: ${cssProps.borders.width} ${cssProps.borders.style} ${cssProps.colors.border} !important;
        border-radius: ${cssProps.borders.radius} !important;
        padding: ${cssProps.spacing.padding} !important;
      }
      
      /* Headers */
      header, .header, nav, .navbar {
        background-color: ${cssProps.colors.background} !important;
        color: ${cssProps.colors.text} !important;
      }
      
      /* Typography */
      h1, h2, h3, h4, h5, h6 {
        color: ${cssProps.colors.text} !important;
        font-weight: ${cssProps.typography.fontWeight} !important;
        line-height: ${cssProps.typography.lineHeight} !important;
      }
      
      /* Custom CSS from user */
      ${customCSS}
    `;
  };

  if (isLoading || !cssProps) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gray-100 border-b px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Builder: {section?.name}
          </div>
          <button
            onClick={handleSave}
            disabled={updateSection.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {updateSection.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Center - Bootstrap Preview */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Top Controls */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded" title="Desktop">
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded" title="Tablet">
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded" title="Mobile">
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  {theme?.extractedHtml && (
                    <>
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded ${
                          showComparison
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'border hover:bg-gray-50'
                        }`}
                        title="Compare original vs styled"
                      >
                        <Eye className="w-4 h-4" />
                        {showComparison ? 'Hide' : 'Show'} Comparison
                      </button>
                      <button
                        onClick={() => setPreviewKey(prev => prev + 1)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="Refresh preview with current CSS"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh Preview
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleExportCSS}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Export CSS
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Export JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              {theme?.extractedHtml ? (
                <div className="h-full flex flex-col">
                  <div className="mb-2 px-4 py-2 bg-green-100 text-green-800 text-sm rounded">
                    ✓ Showing extracted website from: {theme.sourceUrl}
                  </div>
                  <div className="flex-1 flex gap-4">
                    {showComparison && (
                      <div className="flex-1 flex flex-col">
                        <div className="mb-2 text-sm font-medium text-gray-700 text-center">
                          Original
                        </div>
                        <iframe
                          srcDoc={theme.extractedHtml}
                          className="w-full h-full border-0 bg-white rounded-lg shadow"
                          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                          title="Original Website"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col">
                      {showComparison && (
                        <div className="mb-2 text-sm font-medium text-gray-700 text-center">
                          With Your CSS
                        </div>
                      )}
                      <iframe
                        key={previewKey}
                        srcDoc={`
                          ${theme.extractedHtml}
                          <style id="custom-theme-styles">
                            ${generateBootstrapCSS()}
                          </style>
                        `}
                        className="w-full h-full border-0 bg-white rounded-lg shadow"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        title="Website Preview"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow">
                  <style>{generateBootstrapCSS()}</style>
                
                <h1 className="text-3xl font-bold mb-6">Bootstrap Component Preview</h1>
                
                {/* Buttons */}
                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Buttons</h3>
                  <div className="flex gap-3 flex-wrap">
                    <button className="btn btn-primary">Primary Button</button>
                    <button className="btn btn-secondary">Secondary Button</button>
                    <button className="btn btn-success">Success Button</button>
                    <button className="btn btn-outline-primary">Outline Button</button>
                  </div>
                </section>

                {/* Cards */}
                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Cards</h3>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">Card Title</h5>
                          <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                          <button className="btn btn-primary">Go somewhere</button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">Another Card</h5>
                          <p className="card-text">This is another card with some content to demonstrate the styling.</p>
                          <button className="btn btn-secondary">Learn More</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Forms */}
                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Forms</h3>
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Email address</label>
                      <input type="email" className="form-control" placeholder="name@example.com" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Message</label>
                      <textarea className="form-control" rows={3}></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                  </form>
                </section>

                {/* Alerts */}
                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Alerts</h3>
                  <div className="alert alert-primary mb-3">This is a primary alert</div>
                  <div className="alert alert-success">This is a success alert</div>
                </section>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This theme was created manually. To see an actual website preview, 
                    create a theme using "From URL" button on the Theme List page.
                  </p>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - CSS Controls */}
          <div className="w-80 bg-white border-l overflow-y-auto">
            <CollapsibleSection title="Colors" defaultOpen={true}>
              <div className="space-y-3 p-3">
                {Object.entries(cssProps.colors).map(([key, value]) => (
                  <ColorPickerField
                    key={key}
                    label={key}
                    value={String(value || '#000000')}
                    onChange={(newColor) => setCssProps({
                      ...cssProps,
                      colors: { ...cssProps.colors, [key]: newColor }
                    })}
                  />
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Spacing">
              <div className="space-y-3 p-3">
                {Object.entries(cssProps.spacing).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
                    <input
                      type="text"
                      value={String(value || '')}
                      onChange={(e) => setCssProps({
                        ...cssProps,
                        spacing: { ...cssProps.spacing, [key]: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Typography">
              <div className="space-y-3 p-3">
                {Object.entries(cssProps.typography).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-600 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="text"
                      value={String(value || '')}
                      onChange={(e) => setCssProps({
                        ...cssProps,
                        typography: { ...cssProps.typography, [key]: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Background">
              <div className="space-y-3 p-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Background Color</label>
                  <input
                    type="text"
                    value={String(cssProps.colors.background || '')}
                    onChange={(e) => setCssProps({
                      ...cssProps,
                      colors: { ...cssProps.colors, background: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Borders">
              <div className="space-y-3 p-3">
                {Object.entries(cssProps.borders).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
                    <input
                      type="text"
                      value={String(value || '')}
                      onChange={(e) => setCssProps({
                        ...cssProps,
                        borders: { ...cssProps.borders, [key]: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Paddings">
              <div className="space-y-3 p-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Padding</label>
                  <input
                    type="text"
                    value={String(cssProps.spacing.padding || '')}
                    onChange={(e) => setCssProps({
                      ...cssProps,
                      spacing: { ...cssProps.spacing, padding: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Custom CSS">
              <div className="p-3">
                <textarea
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  rows={6}
                  placeholder="/* Custom CSS */"
                  className="w-full px-2 py-1 text-xs border rounded font-mono"
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Effects">
              <div className="space-y-3 p-3">
                {Object.entries(cssProps.effects).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
                    <input
                      type="text"
                      value={String(value || '')}
                      onChange={(e) => setCssProps({
                        ...cssProps,
                        effects: { ...cssProps.effects, [key]: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
      >
        <span className="text-sm font-medium">{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

function ColorPickerField({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1 capitalize">{label}</label>
      <div className="flex gap-2">
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-10 h-8 border rounded cursor-pointer"
            style={{ backgroundColor: value }}
          />
          {showPicker && (
            <div className="absolute z-50 mt-2">
              <div
                className="fixed inset-0"
                onClick={() => setShowPicker(false)}
              />
              <div className="relative bg-white p-3 rounded-lg shadow-xl border">
                <HexColorPicker color={value} onChange={onChange} />
              </div>
            </div>
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 text-sm border rounded"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
