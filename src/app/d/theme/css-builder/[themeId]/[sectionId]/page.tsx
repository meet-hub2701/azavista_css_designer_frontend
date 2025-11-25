'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, RotateCcw, Download, Monitor, Tablet, Smartphone, RefreshCw, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '@/hooks/useThemes';
import { useSection, useUpdateSection } from '@/hooks/useSections';
import Sidebar from '@/components/layout/Sidebar';
import { HexColorPicker } from 'react-colorful';
import SimpleHtmlEditor from '@/components/SimpleHtmlEditor';
import { SectionCSSProperties, TypographyStyle } from '@/shared-types';

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

  // Helper to check if value is hex
  const isHex = (str: string) => /^#[0-9A-F]{6}$/i.test(str);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded border shadow-sm relative overflow-hidden"
          style={{ backgroundColor: isHex(value) ? value : 'transparent' }}
        >
          {!isHex(value) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-[10px] text-gray-500 font-medium">
              {value === 'transparent' ? 'NONE' : 'AUTO'}
            </div>
          )}
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border rounded text-sm"
        />
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-2 p-2 bg-white rounded-lg shadow-xl border" ref={popover}>
          <HexColorPicker color={isHex(value) ? value : '#ffffff'} onChange={onChange} />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => { onChange('transparent'); setIsOpen(false); }}
              className="flex-1 px-2 py-1 text-xs border rounded hover:bg-gray-50"
            >
              Transparent
            </button>
            <button
              onClick={() => { onChange('inherit'); setIsOpen(false); }}
              className="flex-1 px-2 py-1 text-xs border rounded hover:bg-gray-50"
            >
              Inherit
            </button>
          </div>
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
  const [activeButtonTab, setActiveButtonTab] = useState<'primary' | 'secondary'>('primary');
  
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
      if (!props.spacing.paddingValues) props.spacing.paddingValues = { top: '', right: '', bottom: '', left: '' };
      if (!props.spacing.paddingValues) props.spacing.paddingValues = { top: '', right: '', bottom: '', left: '' };
      if (!props.spacing.marginValues) props.spacing.marginValues = { top: '', right: '', bottom: '', left: '' };
      if (!props.effects.animation) {
        props.effects.animation = {
          name: 'none',
          duration: '1s',
          delay: '0s',
          timingFunction: 'ease'
        };
      }
      if (!props.buttons) {
        props.buttons = {
          primary: {
            type: 'contained',
            borderRadius: '4px',
            borderWidth: '1px',
            borderColor: 'transparent',
            backgroundColor: themeData?.theme?.globalStyles?.primaryColor || '#3b82f6',
            typography: {
              fontSize: '16px',
              fontWeight: '500',
              lineHeight: '1.5',
              letterSpacing: 'normal',
              color: '#ffffff',
            }
          },
          secondary: {
            type: 'outlined',
            borderRadius: '4px',
            borderWidth: '1px',
            borderColor: themeData?.theme?.globalStyles?.secondaryColor || '#6b7280',
            backgroundColor: 'transparent',
            typography: {
              fontSize: '16px',
              fontWeight: '500',
              lineHeight: '1.5',
              letterSpacing: 'normal',
              color: themeData?.theme?.globalStyles?.secondaryColor || '#6b7280',
            }
          }
        };
      }
      
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

    const style = (prop: string, val: string | undefined) => val ? `${prop}: ${val} !important;` : '';

    // Base styles for the container (now applied to body/content-root in iframe)
    let css = `
      /* Apply section-level styles to the content wrapper, not the body */
      #content-root {
        width: 100%;
        position: relative;
      }

      /* Apply styles directly to the section element to preserve layout */
      #content-root > :first-child {
        ${style('background-color', colors.background)}
        ${style('color', colors.text)}
        ${style('font-family', typography.fontFamily)}
        ${style('font-size', typography.fontSize)}
        ${style('font-weight', typography.fontWeight)}
        ${style('line-height', typography.lineHeight)}
        ${style('letter-spacing', typography.letterSpacing)}
      
        ${style('padding-top', spacing.paddingValues?.top || spacing.padding)}
        ${style('padding-right', spacing.paddingValues?.right || spacing.padding)}
        ${style('padding-bottom', spacing.paddingValues?.bottom || spacing.padding)}
        ${style('padding-left', spacing.paddingValues?.left || spacing.padding)}
        ${style('margin-top', spacing.marginValues?.top || spacing.margin)}
        ${style('margin-right', spacing.marginValues?.right || spacing.margin)}
        ${style('margin-bottom', spacing.marginValues?.bottom || spacing.margin)}
        ${style('margin-left', spacing.marginValues?.left || spacing.margin)}
        
        ${style('opacity', effects.opacity)}
        ${style('max-width', spacing.pageWidth)}
        
        /* Ensure width is 100% if not set, but respect original if possible? 
           Actually, usually we want full width for sections. */
        width: 100%;
        margin-left: auto;
        margin-right: auto;
        position: relative;
        
        /* Borders */
        ${style('border-radius', borders.radius)}
        ${style('border-width', borders.width)}
        ${style('border-style', borders.style)}
        ${style('border-color', colors.border)}
        
        /* Effects */
        ${style('box-shadow', effects.shadow)}
        ${style('transition', effects.effects?.transition || 'all 0.3s ease')}
      }
      
      /* Apply typography to all elements - REMOVED to prevent overriding original styles */
      /* #content-root * {
        font-family: ${typography.fontFamily || 'inherit'};
      } */
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

    // Generate Button Styles
    if (cssProps.buttons) {
      // ... (existing button CSS generation) ...
      // Helper to generate button CSS
      const generateBtnCss = (style: any, selector: string) => `
        #content-root ${selector} {
          background-color: ${style.backgroundColor} !important;
          border-radius: ${style.borderRadius} !important;
          border-width: ${style.borderWidth} !important;
          border-color: ${style.borderColor} !important;
          border-style: solid !important;
          font-family: ${style.typography.fontFamily || 'inherit'} !important;
          font-size: ${style.typography.fontSize} !important;
          font-weight: ${style.typography.fontWeight} !important;
          line-height: ${style.typography.lineHeight} !important;
          letter-spacing: ${style.typography.letterSpacing} !important;
          color: ${style.typography.color} !important;
          text-transform: ${style.typography.textTransform || 'none'} !important;
          text-decoration: ${style.typography.textDecoration || 'none'} !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0.5rem 1rem !important;
          transition: all 0.2s ease !important;
        }
        #content-root ${selector}:hover {
          opacity: 0.9 !important;
          transform: translateY(-1px) !important;
        }
      `;

      if (cssProps.buttons.primary) {
        css += generateBtnCss(cssProps.buttons.primary, '.btn-primary, button.primary, a.button.primary');
      }
      if (cssProps.buttons.secondary) {
        css += generateBtnCss(cssProps.buttons.secondary, '.btn-secondary, button.secondary, a.button.secondary');
      }
      
      // Also apply primary styles to generic buttons if they don't have a class, or as a default
      if (cssProps.buttons.primary) {
         css += `
          #content-root button:not(.secondary):not(.btn-secondary) {
            background-color: ${cssProps.buttons.primary.backgroundColor} !important;
            border-radius: ${cssProps.buttons.primary.borderRadius} !important;
            border-width: ${cssProps.buttons.primary.borderWidth} !important;
            border-color: ${cssProps.buttons.primary.borderColor} !important;
            border-style: solid !important;
            font-family: ${cssProps.buttons.primary.typography.fontFamily || 'inherit'} !important;
            font-size: ${cssProps.buttons.primary.typography.fontSize} !important;
            font-weight: ${cssProps.buttons.primary.typography.fontWeight} !important;
            color: ${cssProps.buttons.primary.typography.color} !important;
          }
         `;
      }
    }

    // Add Animation Keyframes
    if (effects.animation && effects.animation.name !== 'none') {
      const { name, duration, delay, timingFunction } = effects.animation;
      
      css += `
        #content-root {
          animation-name: ${name};
          animation-duration: ${duration};
          animation-delay: ${delay || '0s'};
          animation-timing-function: ${timingFunction || 'ease'};
          animation-fill-mode: both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInTop {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes slideInBottom {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes zoomIn {
          from { transform: scale(0.3); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes zoomOut {
          from { transform: scale(1.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes rotateIn {
          from { transform: rotate(-200deg); opacity: 0; }
          to { transform: rotate(0); opacity: 1; }
        }

        @keyframes flipInX {
          from { transform: perspective(400px) rotate3d(1, 0, 0, 90deg); animation-timing-function: ease-in; opacity: 0; }
          40% { transform: perspective(400px) rotate3d(1, 0, 0, -20deg); animation-timing-function: ease-in; }
          60% { transform: perspective(400px) rotate3d(1, 0, 0, 10deg); opacity: 1; }
          80% { transform: perspective(400px) rotate3d(1, 0, 0, -5deg); }
          to { transform: perspective(400px); }
        }

        @keyframes flipInY {
          from { transform: perspective(400px) rotate3d(0, 1, 0, 90deg); animation-timing-function: ease-in; opacity: 0; }
          40% { transform: perspective(400px) rotate3d(0, 1, 0, -20deg); animation-timing-function: ease-in; }
          60% { transform: perspective(400px) rotate3d(0, 1, 0, 10deg); opacity: 1; }
          80% { transform: perspective(400px) rotate3d(0, 1, 0, -5deg); }
          to { transform: perspective(400px); }
        }

        @keyframes bounceIn {
          from, 20%, 40%, 60%, 80%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); }
          0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); }
          20% { transform: scale3d(1.1, 1.1, 1.1); }
          40% { transform: scale3d(0.9, 0.9, 0.9); }
          60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); }
          80% { transform: scale3d(0.97, 0.97, 0.97); }
          to { opacity: 1; transform: scale3d(1, 1, 1); }
        }

        @keyframes pulse {
          from { transform: scale3d(1, 1, 1); }
          50% { transform: scale3d(1.05, 1.05, 1.05); }
          to { transform: scale3d(1, 1, 1); }
        }

        @keyframes shake {
          from, to { transform: translate3d(0, 0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate3d(-10px, 0, 0); }
          20%, 40%, 60%, 80% { transform: translate3d(10px, 0, 0); }
        }

        @keyframes swing {
          20% { transform: rotate3d(0, 0, 1, 15deg); }
          40% { transform: rotate3d(0, 0, 1, -10deg); }
          60% { transform: rotate3d(0, 0, 1, 5deg); }
          80% { transform: rotate3d(0, 0, 1, -5deg); }
          to { transform: rotate3d(0, 0, 1, 0deg); }
        }
      `;
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
          {/* Center - Preview Area (Now on Left) */}
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

          {/* Right Panel - Controls (Now on Right) */}
          <div className="w-80 bg-white border-l overflow-y-auto">
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
                
                {/* Effects Controls */}
                <CollapsibleSection title="Effects">
                  <div className="p-4 space-y-4">
                    {/* Shadow */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shadow</label>
                      <select
                        value={cssProps.effects.shadow}
                        onChange={(e) => setCssProps({
                          ...cssProps,
                          effects: { ...cssProps.effects, shadow: e.target.value }
                        })}
                        className="w-full p-2 border rounded text-sm bg-white"
                      >
                        <option value="none">None</option>
                        <option value="0 1px 2px 0 rgb(0 0 0 / 0.05)">Small</option>
                        <option value="0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)">Medium</option>
                        <option value="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)">Large</option>
                        <option value="0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)">Extra Large</option>
                        <option value="0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)">2X Large</option>
                        <option value="inset 0 2px 4px 0 rgb(0 0 0 / 0.05)">Inner</option>
                      </select>
                    </div>

                    {/* Opacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Opacity</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt(String(parseFloat(cssProps.effects.opacity || '1') * 100)) || 100}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            effects: { ...cssProps.effects, opacity: String(parseInt(e.target.value) / 100) }
                          })}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500 w-12 text-right">
                          {parseInt(String(parseFloat(cssProps.effects.opacity || '1') * 100))}%
                        </span>
                      </div>
                    </div>

                    {/* Animation Section */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Page Animation</h4>
                      
                      {/* Animation Name */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-500 mb-1">Animation Type</label>
                        <div className="relative">
                          <select
                            value={cssProps.effects.animation?.name || 'none'}
                            onChange={(e) => setCssProps({
                              ...cssProps,
                              effects: {
                                ...cssProps.effects,
                                animation: {
                                  ...(cssProps.effects.animation || { duration: '1s', delay: '0s', timingFunction: 'ease' }),
                                  name: e.target.value
                                }
                              }
                            })}
                            className="w-full p-2 border rounded text-sm appearance-none bg-white"
                          >
                            <option value="none">None</option>
                            <option value="fadeIn">Fade In</option>
                            <option value="slideInLeft">Slide In (Left)</option>
                            <option value="slideInRight">Slide In (Right)</option>
                            <option value="slideInTop">Slide In (Top)</option>
                            <option value="slideInBottom">Slide In (Bottom)</option>
                            <option value="zoomIn">Zoom In</option>
                            <option value="zoomOut">Zoom Out</option>
                            <option value="rotateIn">Rotate In</option>
                            <option value="flipInX">Flip In (X-axis)</option>
                            <option value="flipInY">Flip In (Y-axis)</option>
                            <option value="bounceIn">Bounce In</option>
                            <option value="pulse">Pulse</option>
                            <option value="shake">Shake</option>
                            <option value="swing">Swing</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Animation Speed */}
                      {cssProps.effects.animation?.name && cssProps.effects.animation.name !== 'none' && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Animation Speed</label>
                          <div className="relative">
                            <select
                              value={cssProps.effects.animation?.duration || '1s'}
                              onChange={(e) => setCssProps({
                                ...cssProps,
                                effects: {
                                  ...cssProps.effects,
                                  animation: {
                                    ...cssProps.effects.animation!,
                                    duration: e.target.value
                                  }
                                }
                              })}
                              className="w-full p-2 border rounded text-sm appearance-none bg-white"
                            >
                              <option value="4s">Very Slow (4s)</option>
                              <option value="2s">Slow (2s)</option>
                              <option value="1s">Normal (1s)</option>
                              <option value="0.5s">Fast (0.5s)</option>
                              <option value="0.3s">Very Fast (0.3s)</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Buttons Controls */}
                <CollapsibleSection title="Buttons" defaultOpen={true}>
                  <div className="p-4 space-y-6">
                    {/* Tabs */}
                    <div className="flex border-b">
                      <button
                        onClick={() => setActiveButtonTab('primary')}
                        className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
                          activeButtonTab === 'primary' 
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        PRIMARY
                      </button>
                      <button
                        onClick={() => setActiveButtonTab('secondary')}
                        className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
                          activeButtonTab === 'secondary' 
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        SECONDARY
                      </button>
                    </div>

                    {/* Button Type */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Button Type</label>
                      <div className="relative">
                        <select
                          value={cssProps.buttons?.[activeButtonTab].type}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            buttons: {
                              ...cssProps.buttons!,
                              [activeButtonTab]: {
                                ...cssProps.buttons![activeButtonTab],
                                type: e.target.value as any
                              }
                            }
                          })}
                          className="w-full p-2 border rounded text-sm appearance-none bg-white"
                        >
                          <option value="contained">contained</option>
                          <option value="outlined">outlined</option>
                          <option value="text">text</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Corner Radius */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm text-gray-700">Corner Radius</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={parseInt(cssProps.buttons?.[activeButtonTab].borderRadius || '0') || 0}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            buttons: {
                              ...cssProps.buttons!,
                              [activeButtonTab]: {
                                ...cssProps.buttons![activeButtonTab],
                                borderRadius: `${e.target.value}px`
                              }
                            }
                          })}
                          className="flex-1"
                        />
                        <div className="flex items-center border rounded px-2 py-1 w-20">
                          <input
                            type="number"
                            value={parseInt(cssProps.buttons?.[activeButtonTab].borderRadius || '0') || 0}
                            onChange={(e) => setCssProps({
                              ...cssProps,
                              buttons: {
                                ...cssProps.buttons!,
                                [activeButtonTab]: {
                                  ...cssProps.buttons![activeButtonTab],
                                  borderRadius: `${e.target.value}px`
                                }
                              }
                            })}
                            className="w-full text-sm outline-none"
                          />
                          <span className="text-xs text-gray-500">px</span>
                        </div>
                      </div>
                    </div>

                    {/* Button Color */}
                    <ColorPickerField
                      label="Select button color"
                      value={cssProps.buttons?.[activeButtonTab].backgroundColor || 'transparent'}
                      onChange={(val) => setCssProps({
                        ...cssProps,
                        buttons: {
                          ...cssProps.buttons!,
                          [activeButtonTab]: {
                            ...cssProps.buttons![activeButtonTab],
                            backgroundColor: val
                          }
                        }
                      })}
                      presetColors={extractedColors}
                    />

                    {/* Border Width */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm text-gray-700">Border Width</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={parseInt(cssProps.buttons?.[activeButtonTab].borderWidth || '0') || 0}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            buttons: {
                              ...cssProps.buttons!,
                              [activeButtonTab]: {
                                ...cssProps.buttons![activeButtonTab],
                                borderWidth: `${e.target.value}px`
                              }
                            }
                          })}
                          className="flex-1"
                        />
                        <div className="flex items-center border rounded px-2 py-1 w-20">
                          <input
                            type="number"
                            value={parseInt(cssProps.buttons?.[activeButtonTab].borderWidth || '0') || 0}
                            onChange={(e) => setCssProps({
                              ...cssProps,
                              buttons: {
                                ...cssProps.buttons!,
                                [activeButtonTab]: {
                                  ...cssProps.buttons![activeButtonTab],
                                  borderWidth: `${e.target.value}px`
                                }
                              }
                            })}
                            className="w-full text-sm outline-none"
                          />
                          <span className="text-xs text-gray-500">px</span>
                        </div>
                      </div>
                    </div>

                    {/* Border Color */}
                    <ColorPickerField
                      label="Select border color"
                      value={cssProps.buttons?.[activeButtonTab].borderColor || 'transparent'}
                      onChange={(val) => setCssProps({
                        ...cssProps,
                        buttons: {
                          ...cssProps.buttons!,
                          [activeButtonTab]: {
                            ...cssProps.buttons![activeButtonTab],
                            borderColor: val
                          }
                        }
                      })}
                      presetColors={extractedColors}
                    />

                    {/* Typography Section for Buttons */}
                    <div className="border-t pt-4 space-y-4">
                      {/* Font Family */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Font</label>
                        <div className="relative">
                          <select
                            value={cssProps.buttons?.[activeButtonTab].typography.fontFamily || 'inherit'}
                            onChange={(e) => setCssProps({
                              ...cssProps,
                              buttons: {
                                ...cssProps.buttons!,
                                [activeButtonTab]: {
                                  ...cssProps.buttons![activeButtonTab],
                                  typography: {
                                    ...cssProps.buttons![activeButtonTab].typography,
                                    fontFamily: e.target.value
                                  }
                                }
                              }
                            })}
                            className="w-full p-2 border rounded text-sm appearance-none bg-white"
                          >
                            <option value="inherit">Inherit</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                            <option value="'Times New Roman', Times, serif">Times New Roman</option>
                            <option value="'Courier New', Courier, monospace">Courier New</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            {extractedFonts.map((font, i) => (
                              <option key={i} value={font}>{font}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Font Size */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Font Size</label>
                          <div className="relative">
                            <select
                              value={cssProps.buttons?.[activeButtonTab].typography.fontSize || '16px'}
                              onChange={(e) => setCssProps({
                                ...cssProps,
                                buttons: {
                                  ...cssProps.buttons!,
                                  [activeButtonTab]: {
                                    ...cssProps.buttons![activeButtonTab],
                                    typography: {
                                      ...cssProps.buttons![activeButtonTab].typography,
                                      fontSize: e.target.value
                                    }
                                  }
                                }
                              })}
                              className="w-full p-2 border rounded text-sm appearance-none bg-white"
                            >
                              {[12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72].map(size => (
                                <option key={size} value={`${size}px`}>{size}px</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Font Weight */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Font Weight</label>
                          <div className="relative">
                            <select
                              value={cssProps.buttons?.[activeButtonTab].typography.fontWeight || '400'}
                              onChange={(e) => setCssProps({
                                ...cssProps,
                                buttons: {
                                  ...cssProps.buttons!,
                                  [activeButtonTab]: {
                                    ...cssProps.buttons![activeButtonTab],
                                    typography: {
                                      ...cssProps.buttons![activeButtonTab].typography,
                                      fontWeight: e.target.value
                                    }
                                  }
                                }
                              })}
                              className="w-full p-2 border rounded text-sm appearance-none bg-white"
                            >
                              <option value="300">Light</option>
                              <option value="400">Regular</option>
                              <option value="500">Medium</option>
                              <option value="600">Semi Bold</option>
                              <option value="700">Bold</option>
                              <option value="800">Extra Bold</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Letter Spacing */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Letter spacing</label>
                          <div className="relative">
                            <select
                              value={cssProps.buttons?.[activeButtonTab].typography.letterSpacing || 'normal'}
                              onChange={(e) => setCssProps({
                                ...cssProps,
                                buttons: {
                                  ...cssProps.buttons!,
                                  [activeButtonTab]: {
                                    ...cssProps.buttons![activeButtonTab],
                                    typography: {
                                      ...cssProps.buttons![activeButtonTab].typography,
                                      letterSpacing: e.target.value
                                    }
                                  }
                                }
                              })}
                              className="w-full p-2 border rounded text-sm appearance-none bg-white"
                            >
                              <option value="-1px">-1px</option>
                              <option value="normal">normal</option>
                              <option value="1px">1px</option>
                              <option value="2px">2px</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Line Height */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Line Height</label>
                          <div className="relative">
                            <select
                              value={cssProps.buttons?.[activeButtonTab].typography.lineHeight || 'normal'}
                              onChange={(e) => setCssProps({
                                ...cssProps,
                                buttons: {
                                  ...cssProps.buttons!,
                                  [activeButtonTab]: {
                                    ...cssProps.buttons![activeButtonTab],
                                    typography: {
                                      ...cssProps.buttons![activeButtonTab].typography,
                                      lineHeight: e.target.value
                                    }
                                  }
                                }
                              })}
                              className="w-full p-2 border rounded text-sm appearance-none bg-white"
                            >
                              <option value="1">1</option>
                              <option value="1.2">1.2</option>
                              <option value="1.5">1.5</option>
                              <option value="normal">normal</option>
                              <option value="2">2</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Font Formatting */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Font Formatting</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCssProps({
                              ...cssProps,
                              buttons: {
                                ...cssProps.buttons!,
                                [activeButtonTab]: {
                                  ...cssProps.buttons![activeButtonTab],
                                  typography: {
                                    ...cssProps.buttons![activeButtonTab].typography,
                                    fontWeight: cssProps.buttons![activeButtonTab].typography.fontWeight === '700' ? '400' : '700'
                                  }
                                }
                              }
                            })}
                            className={`w-10 h-10 border rounded flex items-center justify-center hover:bg-gray-50 ${
                              cssProps.buttons?.[activeButtonTab].typography.fontWeight === '700' ? 'bg-blue-50 border-blue-200 text-blue-600' : ''
                            }`}
                          >
                            <span className="font-bold">B</span>
                          </button>
                          <button
                            onClick={() => setCssProps({
                              ...cssProps,
                              buttons: {
                                ...cssProps.buttons!,
                                [activeButtonTab]: {
                                  ...cssProps.buttons![activeButtonTab],
                                  typography: {
                                    ...cssProps.buttons![activeButtonTab].typography,
                                    textDecoration: cssProps.buttons![activeButtonTab].typography.textDecoration === 'underline' ? 'none' : 'underline'
                                  }
                                }
                              }
                            })}
                            className={`w-10 h-10 border rounded flex items-center justify-center hover:bg-gray-50 ${
                              cssProps.buttons?.[activeButtonTab].typography.textDecoration === 'underline' ? 'bg-blue-50 border-blue-200 text-blue-600' : ''
                            }`}
                          >
                            <span className="underline">U</span>
                          </button>
                          <button
                            onClick={() => setCssProps({
                              ...cssProps,
                              buttons: {
                                ...cssProps.buttons!,
                                [activeButtonTab]: {
                                  ...cssProps.buttons![activeButtonTab],
                                  typography: {
                                    ...cssProps.buttons![activeButtonTab].typography,
                                    fontFamily: 'italic' // Simplified for demo, usually font-style
                                  }
                                }
                              }
                            })}
                            className="w-10 h-10 border rounded flex items-center justify-center hover:bg-gray-50"
                          >
                            <span className="italic">I</span>
                          </button>
                        </div>
                      </div>

                      {/* Font Color */}
                      <ColorPickerField
                        label="Select Font color"
                        value={cssProps.buttons?.[activeButtonTab].typography.color || '#000000'}
                        onChange={(val) => setCssProps({
                          ...cssProps,
                          buttons: {
                            ...cssProps.buttons!,
                            [activeButtonTab]: {
                              ...cssProps.buttons![activeButtonTab],
                              typography: {
                                ...cssProps.buttons![activeButtonTab].typography,
                                color: val
                              }
                            }
                          }
                        })}
                        presetColors={extractedColors}
                      />
                    </div>
                  </div>
                </CollapsibleSection>

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
