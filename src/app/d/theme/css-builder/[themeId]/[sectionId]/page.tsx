'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, RotateCcw, Download, Monitor, Tablet, Smartphone, RefreshCw, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '@/hooks/useThemes';
import { useSection, useUpdateSection } from '@/hooks/useSections';
import Sidebar from '@/components/layout/Sidebar';
import { HexColorPicker } from 'react-colorful';
import SimpleHtmlEditor from '@/components/SimpleHtmlEditor';
import { SectionCSSProperties, TypographyStyle } from '@shared/types';

// Helper component for color picker
const ColorPickerField = ({ label, value, onChange, presetColors = [] }: { label: string, value: string, onChange: (val: string) => void, presetColors?: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popover.current && !popover.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded border shadow-sm"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border rounded text-sm"
        />
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-2 p-2 bg-white rounded-lg shadow-xl border" ref={popover}>
          <HexColorPicker color={value} onChange={onChange} />
          {presetColors.length > 0 && (
            <div className="mt-3 border-t pt-2">
              <div className="text-xs text-gray-500 mb-2">Website Colors</div>
              <div className="flex flex-wrap gap-1 max-w-[200px]">
                {presetColors.map((color, i) => (
                  <button
                    key={i}
                    className="w-6 h-6 rounded-full border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => onChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper component for collapsible sections
const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-700">{title}</span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </button>
      {isOpen && <div className="border-t">{children}</div>}
    </div>
  );
};

export default function CSSBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const themeId = params.themeId as string;
  const sectionId = params.sectionId as string;
  
  const { data: themeData } = useTheme(themeId);
  const { data: section, isLoading } = useSection(sectionId);
  const updateSection = useUpdateSection();

  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [activeTypographyTab, setActiveTypographyTab] = useState<string>('body');
  const [showComparison, setShowComparison] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [cssProps, setCssProps] = useState<SectionCSSProperties | null>(null);
  const [customCSS, setCustomCSS] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  const extractedFonts = themeData?.theme?.extractedFonts || [];
  const extractedColors = themeData?.theme?.extractedColors || [];
  
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (section) {
      // Ensure all nested objects exist
      const props = section.cssProperties;
      if (!props.typography.tags) props.typography.tags = {};
      if (!props.spacing.paddingValues) props.spacing.paddingValues = { top: '0px', right: '0px', bottom: '0px', left: '0px' };
      if (!props.spacing.marginValues) props.spacing.marginValues = { top: '0px', right: '0px', bottom: '0px', left: '0px' };
      
      setCssProps(props);
      setCustomCSS(section.customCSS || '');
      setHtmlContent(section.htmlContent || '');
    }
  }, [section]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'HTML_UPDATE') {
        setHtmlContent(event.data.html);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update CSS in iframe without reload
  useEffect(() => {
    if (previewRef.current && previewRef.current.contentDocument) {
      const styleEl = previewRef.current.contentDocument.getElementById('generated-css');
      if (styleEl) {
        styleEl.textContent = generateBootstrapCSS();
      }
    }
  }, [cssProps, customCSS]);

  const handleSave = async () => {
    if (!cssProps) return;
    
    try {
      await updateSection.mutateAsync({
        id: sectionId,
        data: {
          cssProperties: cssProps,
          customCSS,
          htmlContent,
        },
      });
      alert('Section saved successfully!');
    } catch (error) {
      alert('Failed to save section');
    }
  };

  const handleHtmlSave = (newHtml: string) => {
    console.log('Parent received new HTML, length:', newHtml.length);
    setHtmlContent(newHtml);
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
      theme: themeData?.theme?.name,
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
    
    const { colors, typography, spacing, borders, effects } = cssProps;

    // Base styles for the container (now applied to body/content-root in iframe)
    let css = `
      body {
        background-color: ${colors.background} !important;
        color: ${colors.text} !important;
        font-family: ${typography.fontFamily} !important;
        font-size: ${typography.fontSize} !important;
        font-weight: ${typography.fontWeight} !important;
        line-height: ${typography.lineHeight} !important;
        letter-spacing: ${typography.letterSpacing} !important;
      }
      
      #content-root {
        padding-top: ${spacing.paddingValues?.top || spacing.padding};
        padding-right: ${spacing.paddingValues?.right || spacing.padding};
        padding-bottom: ${spacing.paddingValues?.bottom || spacing.padding};
        padding-left: ${spacing.paddingValues?.left || spacing.padding};
        margin-top: ${spacing.marginValues?.top || spacing.margin};
        margin-right: ${spacing.marginValues?.right || spacing.margin};
        margin-bottom: ${spacing.marginValues?.bottom || spacing.margin};
        margin-left: ${spacing.marginValues?.left || spacing.margin};
        opacity: ${effects.opacity};
        max-width: ${spacing.pageWidth || '100%'};
        width: 100%;
        margin-left: auto;
        margin-right: auto;
        position: relative;
      }
      
      /* Apply typography to all elements */
      #content-root * {
        font-family: ${typography.fontFamily || 'inherit'};
      }
    `;

    // Generate styles for specific tags (h1-h6, p, etc.)
    if (typography.tags) {
      Object.entries(typography.tags).forEach(([tag, style]) => {
        css += `
          #content-root ${tag} {
            ${style.fontFamily ? `font-family: ${style.fontFamily} !important;` : ''}
            ${style.fontSize ? `font-size: ${style.fontSize} !important;` : ''}
            ${style.fontWeight ? `font-weight: ${style.fontWeight} !important;` : ''}
            ${style.lineHeight ? `line-height: ${style.lineHeight} !important;` : ''}
            ${style.letterSpacing ? `letter-spacing: ${style.letterSpacing} !important;` : ''}
            ${style.color ? `color: ${style.color} !important;` : ''}
            ${style.textTransform ? `text-transform: ${style.textTransform} !important;` : ''}
            ${style.textDecoration ? `text-decoration: ${style.textDecoration} !important;` : ''}
          }
        `;
      });
    }

    // Add custom CSS
    css += `
      ${customCSS}
    `;

    return css;
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
        <div className="bg-gray-100 border-b px-6 py-3">
          <div className="text-sm text-gray-600">
            Builder: {section?.name}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex gap-2">
                  <button onClick={handleReset} className="p-2 hover:bg-gray-100 rounded-full" title="Reset">
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                  </button>
                  <button onClick={handleSave} className="p-2 hover:bg-blue-50 rounded-full text-blue-600" title="Save">
                    <Save className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 py-2 text-sm font-medium rounded ${
                    activeTab === 'preview' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex-1 py-2 text-sm font-medium rounded ${
                    activeTab === 'code' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Code
                </button>
              </div>
            </div>

            {activeTab === 'code' ? (
              <div className="p-4 space-y-4">
                <button
                  onClick={handleExportCSS}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium text-gray-700"
                >
                  <Download className="w-4 h-4" />
                  Export CSS
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium text-gray-700"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {/* Advanced CSS Controls */}
                
                <CollapsibleSection title="Spacing">
                  <div className="space-y-4 p-4">
                    {/* Page Width */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page Width</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="320"
                          max="1920"
                          value={parseInt(cssProps.spacing.pageWidth || '1200') || 1200}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            spacing: { ...cssProps.spacing, pageWidth: `${e.target.value}px` }
                          })}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          value={parseInt(cssProps.spacing.pageWidth || '1200') || 1200}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            spacing: { ...cssProps.spacing, pageWidth: `${e.target.value}px` }
                          })}
                          className="w-24 px-2 py-1 text-sm border rounded"
                        />
                        <span className="text-sm text-gray-500">px</span>
                      </div>
                    </div>

                    {/* Visual Box Model */}
                    <div className="border-2 border-dashed border-gray-300 p-4 relative mt-4">
                      <span className="absolute top-1 left-1 text-xs text-gray-400">Margin</span>
                      
                      {/* Top Margin */}
                      <div className="flex justify-center mb-2">
                        <input
                          type="number"
                          value={parseInt(cssProps.spacing.marginValues?.top || cssProps.spacing.margin) || 0}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            spacing: {
                              ...cssProps.spacing,
                              marginValues: {
                                ...(cssProps.spacing.marginValues || { top: '0px', right: '0px', bottom: '0px', left: '0px' }),
                                top: `${e.target.value}px`
                              }
                            }
                          })}
                          className="w-16 px-2 py-1 text-sm border rounded text-center"
                          placeholder="Top"
                        />
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        {/* Left Margin */}
                        <input
                          type="number"
                          value={parseInt(cssProps.spacing.marginValues?.left || cssProps.spacing.margin) || 0}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            spacing: {
                              ...cssProps.spacing,
                              marginValues: {
                                ...(cssProps.spacing.marginValues || { top: '0px', right: '0px', bottom: '0px', left: '0px' }),
                                left: `${e.target.value}px`
                              }
                            }
                          })}
                          className="w-16 px-2 py-1 text-sm border rounded text-center"
                          placeholder="Left"
                        />
                        
                        {/* Padding Box */}
                        <div className="border-2 border-dashed border-gray-400 p-4 relative w-full mx-2">
                          <span className="absolute top-1 left-1 text-xs text-gray-400">Padding</span>
                          
                          {/* Top Padding */}
                          <div className="flex justify-center mb-2">
                            <input
                              type="number"
                              value={parseInt(cssProps.spacing.paddingValues?.top || cssProps.spacing.padding) || 0}
                              onChange={(e) => setCssProps({
                                ...cssProps,
                                spacing: {
                                  ...cssProps.spacing,
                                  paddingValues: {
                                    ...(cssProps.spacing.paddingValues || { top: '0px', right: '0px', bottom: '0px', left: '0px' }),
                                    top: `${e.target.value}px`
                                  }
                                }
                              })}
                              className="w-16 px-2 py-1 text-sm border rounded text-center"
                              placeholder="Top"
                            />
                          </div>

                          <div className="flex justify-between items-center">
                            {/* Left Padding */}
                            <input
                              type="number"
                              value={parseInt(cssProps.spacing.paddingValues?.left || cssProps.spacing.padding) || 0}
                              onChange={(e) => setCssProps({
                                ...cssProps,
                                spacing: {
                                  ...cssProps.spacing,
                                  paddingValues: {
                                    ...(cssProps.spacing.paddingValues || { top: '0px', right: '0px', bottom: '0px', left: '0px' }),
                                    left: `${e.target.value}px`
                                  }
                                }
                              })}
                              className="w-16 px-2 py-1 text-sm border rounded text-center"
                              placeholder="Left"
                            />
                            
                            {/* Content Area Placeholder */}
                            <div className="bg-gray-100 flex-1 h-8 mx-2 flex items-center justify-center text-xs text-gray-500 rounded">
                              Content
                            </div>

                            {/* Right Padding */}
                            <input
                              type="number"
                              value={parseInt(cssProps.spacing.paddingValues?.right || cssProps.spacing.padding) || 0}
                              onChange={(e) => setCssProps({
                                ...cssProps,
                                spacing: {
                                  ...cssProps.spacing,
                                  paddingValues: {
                                    ...(cssProps.spacing.paddingValues || { top: '0px', right: '0px', bottom: '0px', left: '0px' }),
                                    right: `${e.target.value}px`
                                  }
                                }
                              })}
                              className="w-16 px-2 py-1 text-sm border rounded text-center"
                              placeholder="Right"
                            />
                          </div>

                          {/* Bottom Padding */}
                          <div className="flex justify-center mt-2">
                            <input
                              type="number"
                              value={parseInt(cssProps.spacing.paddingValues?.bottom || cssProps.spacing.padding) || 0}
                              onChange={(e) => setCssProps({
                                ...cssProps,
                                spacing: {
                                  ...cssProps.spacing,
                                  paddingValues: {
                                    ...(cssProps.spacing.paddingValues || { top: '0px', right: '0px', bottom: '0px', left: '0px' }),
                                    bottom: `${e.target.value}px`
                                  }
                                }
                              })}
                              className="w-16 px-2 py-1 text-sm border rounded text-center"
                              placeholder="Bottom"
                            />
                          </div>
                        </div>

                        {/* Right Margin */}
                        <input
                          type="number"
                          value={parseInt(cssProps.spacing.marginValues?.right || cssProps.spacing.margin) || 0}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            spacing: {
                              ...cssProps.spacing,
                              marginValues: {
                                ...(cssProps.spacing.marginValues || { top: '0px', right: '0px', bottom: '0px', left: '0px' }),
                                right: `${e.target.value}px`
                              }
                            }
                          })}
                          className="w-16 px-2 py-1 text-sm border rounded text-center"
                          placeholder="Right"
                        />
                      </div>

                      {/* Bottom Margin */}
                      <div className="flex justify-center mt-2">
                        <input
                          type="number"
                          value={parseInt(cssProps.spacing.marginValues?.bottom || cssProps.spacing.margin) || 0}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            spacing: {
                              ...cssProps.spacing,
                              marginValues: {
                                ...(cssProps.spacing.marginValues || { top: '0px', right: '0px', bottom: '0px', left: '0px' }),
                                bottom: `${e.target.value}px`
                              }
                            }
                          })}
                          className="w-16 px-2 py-1 text-sm border rounded text-center"
                          placeholder="Bottom"
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Typography">
                  <div className="space-y-4 p-4">
                    {/* Heading Tabs */}
                    <div className="flex border-b overflow-x-auto">
                      {['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setActiveTypographyTab(tag)}
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                            activeTypographyTab === tag
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {tag === 'body' ? 'Body' : tag.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* Text settings */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900">Text settings for {activeTypographyTab === 'body' ? 'Body' : activeTypographyTab.toUpperCase()}</h3>
                      
                      {/* Font */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Font</label>
                        <select
                          value={
                            (activeTypographyTab === 'body' 
                              ? cssProps.typography.fontFamily 
                              : cssProps.typography.tags?.[activeTypographyTab]?.fontFamily) || 'Arial'
                          }
                          onChange={(e) => {
                            if (activeTypographyTab === 'body') {
                              setCssProps({
                                ...cssProps,
                                typography: { ...cssProps.typography, fontFamily: e.target.value }
                              });
                            } else {
                              const currentTags = cssProps.typography.tags || {};
                              setCssProps({
                                ...cssProps,
                                typography: {
                                  ...cssProps.typography,
                                  tags: {
                                    ...currentTags,
                                    [activeTypographyTab]: {
                                      ...(currentTags[activeTypographyTab] || {}),
                                      fontFamily: e.target.value
                                    }
                                  }
                                }
                              });
                            }
                          }}
                          className="w-full px-3 py-2 border rounded text-sm"
                        >
                          <optgroup label="Standard Fonts">
                            <option>Arial</option>
                            <option>Helvetica</option>
                            <option>Times New Roman</option>
                            <option>Georgia</option>
                            <option>Verdana</option>
                            <option>Inter</option>
                            <option>Roboto</option>
                          </optgroup>
                          {extractedFonts.length > 0 && (
                            <optgroup label="Extracted Fonts">
                              {extractedFonts.map((font, i) => (
                                <option key={i} value={font}>{font}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>

                      {/* Font Weight */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Font Weight</label>
                        <select
                          value={
                            (activeTypographyTab === 'body' 
                              ? cssProps.typography.fontWeight 
                              : cssProps.typography.tags?.[activeTypographyTab]?.fontWeight) || '400'
                          }
                          onChange={(e) => {
                            if (activeTypographyTab === 'body') {
                              setCssProps({
                                ...cssProps,
                                typography: { ...cssProps.typography, fontWeight: e.target.value }
                              });
                            } else {
                              const currentTags = cssProps.typography.tags || {};
                              setCssProps({
                                ...cssProps,
                                typography: {
                                  ...cssProps.typography,
                                  tags: {
                                    ...currentTags,
                                    [activeTypographyTab]: {
                                      ...(currentTags[activeTypographyTab] || {}),
                                      fontWeight: e.target.value
                                    }
                                  }
                                }
                              });
                            }
                          }}
                          className="w-full px-3 py-2 border rounded text-sm"
                        >
                          <option value="300">Light</option>
                          <option value="400">Regular</option>
                          <option value="500">Medium</option>
                          <option value="600">Semi Bold</option>
                          <option value="700">Bold</option>
                        </select>
                      </div>

                      {/* Letter Spacing & Line Height */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Letter spacing</label>
                          <select
                            value={
                              (activeTypographyTab === 'body' 
                                ? cssProps.typography.letterSpacing 
                                : cssProps.typography.tags?.[activeTypographyTab]?.letterSpacing) || 'normal'
                            }
                            onChange={(e) => {
                              if (activeTypographyTab === 'body') {
                                setCssProps({
                                  ...cssProps,
                                  typography: { ...cssProps.typography, letterSpacing: e.target.value }
                                });
                              } else {
                                const currentTags = cssProps.typography.tags || {};
                                setCssProps({
                                  ...cssProps,
                                  typography: {
                                    ...cssProps.typography,
                                    tags: {
                                      ...currentTags,
                                      [activeTypographyTab]: {
                                        ...(currentTags[activeTypographyTab] || {}),
                                        letterSpacing: e.target.value
                                      }
                                    }
                                  }
                                });
                              }
                            }}
                            className="w-full px-3 py-2 border rounded text-sm"
                          >
                            <option value="normal">normal</option>
                            <option value="0.5px">0.5px</option>
                            <option value="1px">1px</option>
                            <option value="2px">2px</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Line Height</label>
                          <select
                            value={
                              (activeTypographyTab === 'body' 
                                ? cssProps.typography.lineHeight 
                                : cssProps.typography.tags?.[activeTypographyTab]?.lineHeight) || 'normal'
                            }
                            onChange={(e) => {
                              if (activeTypographyTab === 'body') {
                                setCssProps({
                                  ...cssProps,
                                  typography: { ...cssProps.typography, lineHeight: e.target.value }
                                });
                              } else {
                                const currentTags = cssProps.typography.tags || {};
                                setCssProps({
                                  ...cssProps,
                                  typography: {
                                    ...cssProps.typography,
                                    tags: {
                                      ...currentTags,
                                      [activeTypographyTab]: {
                                        ...(currentTags[activeTypographyTab] || {}),
                                        lineHeight: e.target.value
                                      }
                                    }
                                  }
                                });
                              }
                            }}
                            className="w-full px-3 py-2 border rounded text-sm"
                          >
                            <option value="normal">normal</option>
                            <option value="1">1</option>
                            <option value="1.5">1.5</option>
                            <option value="2">2</option>
                          </select>
                        </div>
                      </div>

                      {/* Font Formatting */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Font Formatting</label>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 border rounded hover:bg-gray-50 font-bold">B</button>
                          <button className="px-4 py-2 border rounded hover:bg-gray-50 underline">U</button>
                          <button className="px-4 py-2 border rounded hover:bg-gray-50 italic">I</button>
                        </div>
                      </div>

                      {/* Select Font color */}
                      <ColorPickerField
                        label="Font Color"
                        value={
                          (activeTypographyTab === 'body' 
                            ? cssProps.colors.text 
                            : cssProps.typography.tags?.[activeTypographyTab]?.color) || cssProps.colors.text
                        }
                        presetColors={extractedColors}
                        onChange={(color) => {
                          if (activeTypographyTab === 'body') {
                            setCssProps({
                              ...cssProps,
                              colors: { ...cssProps.colors, text: color }
                            });
                          } else {
                            const currentTags = cssProps.typography.tags || {};
                            setCssProps({
                              ...cssProps,
                              typography: {
                                ...cssProps.typography,
                                tags: {
                                  ...currentTags,
                                  [activeTypographyTab]: {
                                    ...(currentTags[activeTypographyTab] || {}),
                                    color: color
                                  }
                                }
                              }
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Background">
                  <div className="space-y-4 p-4">
                    {/* Color Picker */}
                    <ColorPickerField
                      label="Background Color"
                      value={cssProps.colors.background}
                      presetColors={extractedColors}
                      onChange={(color) => setCssProps({
                        ...cssProps,
                        colors: { ...cssProps.colors, background: color }
                      })}
                    />
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Borders">
                  <div className="space-y-4 p-4">
                    {/* Border Width */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Border Width</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={parseInt(cssProps.borders.width) || 0}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            borders: { ...cssProps.borders, width: `${e.target.value}px` }
                          })}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          value={parseInt(cssProps.borders.width) || 0}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            borders: { ...cssProps.borders, width: `${e.target.value}px` }
                          })}
                          className="w-24 px-2 py-1 text-sm border rounded"
                        />
                        <span className="text-sm text-gray-500">px</span>
                      </div>
                    </div>

                    {/* Select stroke color */}
                    <ColorPickerField
                      label="Border Color"
                      value={cssProps.colors.border}
                      presetColors={extractedColors}
                      onChange={(color) => setCssProps({
                        ...cssProps,
                        colors: { ...cssProps.colors, border: color }
                      })}
                    />

                    {/* Corner Radius */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Corner Radius</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={parseInt(cssProps.borders.radius) || 0}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            borders: { ...cssProps.borders, radius: `${e.target.value}px` }
                          })}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          value={parseInt(cssProps.borders.radius) || 0}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            borders: { ...cssProps.borders, radius: `${e.target.value}px` }
                          })}
                          className="w-24 px-2 py-1 text-sm border rounded"
                        />
                        <span className="text-sm text-gray-500">px</span>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            )}
          </div>

          {/* Center - Preview Area */}
          <div className="flex-1 flex flex-col bg-gray-100">
            {/* Top Controls */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewport('desktop')}
                    className={`p-2 rounded ${viewport === 'desktop' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                    title="Desktop"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewport('tablet')}
                    className={`p-2 rounded ${viewport === 'tablet' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                    title="Tablet"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewport('mobile')}
                    className={`p-2 rounded ${viewport === 'mobile' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                    title="Mobile"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  {themeData?.theme?.extractedHtml && (
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
                  {htmlContent && (
                    <button
                      onClick={() => setShowHtmlEditor(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Edit HTML
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-8 bg-gray-100">
              {htmlContent ? (
                <div className="h-full flex flex-col">
                  <div className="mb-2 px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded flex items-center justify-between">
                    <span>✏️ Click on any text to edit it inline</span>
                    <span className="text-xs">Changes auto-save when you click outside</span>
                  </div>
                  <div className="flex-1 flex gap-4 justify-center">
                    {showComparison && themeData?.theme?.extractedHtml && (
                      <div className="flex-1 flex flex-col max-w-[50%]">
                        <div className="mb-2 text-sm font-medium text-gray-700 text-center">
                          Original
                        </div>
                        <iframe
                          srcDoc={themeData.theme.extractedHtml}
                          className="w-full h-full border-0 bg-white rounded-lg shadow"
                          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                          title="Original Website"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col group transition-all duration-300" style={{ maxWidth: showComparison ? '50%' : '100%' }}>
                      {showComparison && (
                        <div className="mb-2 text-sm font-medium text-gray-700 text-center">
                          Editable Preview
                        </div>
                      )}
                      <div 
                        className="bg-white rounded-lg shadow overflow-hidden transition-all duration-300 mx-auto"
                        style={{
                          width: viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%',
                          height: viewport === 'mobile' ? '667px' : viewport === 'tablet' ? '1024px' : '100%',
                          maxWidth: '100%',
                          maxHeight: '100%',
                        }}
                      >
                        <iframe
                          ref={previewRef as any}
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                ${themeData?.theme?.sourceUrl ? `<base href="${themeData.theme.sourceUrl}">` : ''}
                                ${themeData?.theme?.extractedHtml ? 
                                  (themeData.theme.extractedHtml.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || []).join('\n') 
                                  : ''
                                }
                                <style>
                                  /* Extracted Global CSS */
                                  ${themeData?.theme?.extractedCss || ''}
                                </style>
                                <style id="generated-css">
                                  ${generateBootstrapCSS()}
                                </style>
                                <style>
                                  /* Editor UI Styles */
                                  body { margin: 0; min-height: 100vh; }
                                  [contenteditable="true"] {
                                    outline: 2px solid #3b82f6;
                                    outline-offset: 2px;
                                    border-radius: 2px;
                                    min-width: 1em;
                                    cursor: text;
                                  }
                                  *:hover:not([contenteditable="true"]) {
                                    cursor: pointer;
                                    outline: 1px dashed #9ca3af;
                                    outline-offset: 2px;
                                  }
                                </style>
                              </head>
                              <body>
                                <div id="content-root">${htmlContent}</div>
                                <script>
                                  document.addEventListener('click', (e) => {
                                    const target = e.target;
                                    // Don't trigger if clicking the container itself or already editing
                                    if (target.id === 'content-root' || target === document.body || target.isContentEditable) return;
                                    
                                    // Prevent default link navigation while editing
                                    if (target.tagName === 'A') {
                                      e.preventDefault();
                                    }

                                    // Make editable
                                    target.contentEditable = 'true';
                                    target.focus();
                                    
                                    const handleBlur = () => {
                                      target.contentEditable = 'false';
                                      target.removeAttribute('contenteditable');
                                      target.removeEventListener('blur', handleBlur);
                                      
                                      // Send new HTML to parent
                                      window.parent.postMessage({
                                        type: 'HTML_UPDATE',
                                        html: document.getElementById('content-root').innerHTML
                                      }, '*');
                                    };
                                    
                                    target.addEventListener('blur', handleBlur);
                                  });
                                </script>
                              </body>
                            </html>
                          `}
                          className="w-full h-full border-0"
                          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                          title="Editable Preview"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No content available to preview
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HTML Editor Modal */}
      <SimpleHtmlEditor
        isOpen={showHtmlEditor}
        onClose={() => setShowHtmlEditor(false)}
        html={htmlContent}
        onSave={handleHtmlSave}
      />
    </div>
  );
}
