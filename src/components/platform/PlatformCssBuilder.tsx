'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, RotateCcw, Download, Monitor, Tablet, Smartphone, 
  RefreshCw, Eye, ChevronDown, ChevronRight, Home, Layout, 
  Type, Palette, Box, Layers, MousePointer, Code, Zap, Grid
} from 'lucide-react';
import { useTheme } from '@/hooks/useThemes';
import { useSection, useUpdateSection } from '@/hooks/useSections';
import PlatformSidebar from '@/components/platform/PlatformSidebar';
import { HexColorPicker } from 'react-colorful';
import { SectionCSSProperties, TypographyStyle, BoxModel } from '@/shared-types';
import SimpleHtmlEditor from '@/components/SimpleHtmlEditor';

const defaultBoxModel: BoxModel = { top: '0px', right: '0px', bottom: '0px', left: '0px' };

// --- Helper Components ---

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

  const isHex = (str: string) => /^#[0-9A-F]{6}$/i.test(str);

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-md border border-slate-200 shadow-sm relative overflow-hidden transition-transform active:scale-95"
          style={{ backgroundColor: isHex(value) ? value : 'transparent' }}
        >
          {!isHex(value) && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-[10px] text-slate-400 font-medium">
              {value === 'transparent' ? 'NONE' : 'AUTO'}
            </div>
          )}
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>
      {isOpen && (
        <div className="absolute z-20 mt-2 p-3 bg-white rounded-xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-100" ref={popover}>
          <HexColorPicker color={isHex(value) ? value : '#ffffff'} onChange={onChange} />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => { onChange('transparent'); setIsOpen(false); }}
              className="flex-1 px-2 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              Transparent
            </button>
            <button
              onClick={() => { onChange('inherit'); setIsOpen(false); }}
              className="flex-1 px-2 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              Inherit
            </button>
          </div>
          {presetColors.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-2">
              <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Website Colors</div>
              <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                {presetColors.map((color, i) => (
                  <button
                    key={i}
                    className="w-5 h-5 rounded-full border border-slate-200 hover:scale-110 transition-transform shadow-sm"
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

const AccordionItem = ({ title, icon: Icon, children, defaultOpen = false }: { title: string, icon?: any, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />}
          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && <div className="px-5 pb-5 animate-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
};

// --- Main Component ---

interface PlatformCssBuilderProps {
  themeId: string;
  sectionId: string;
}

const defaultTypographyStyle: TypographyStyle = {
  fontSize: '16px',
  fontWeight: '400',
  lineHeight: '1.5',
  letterSpacing: 'normal'
};

export default function PlatformCssBuilder({ themeId, sectionId }: PlatformCssBuilderProps) {
  const router = useRouter();
  
  const { data: themeData } = useTheme(themeId);
  const { data: section, isLoading } = useSection(sectionId);
  const updateSection = useUpdateSection();

  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeButtonTab, setActiveButtonTab] = useState<'primary' | 'secondary'>('primary');
  const [activeTypographyTab, setActiveTypographyTab] = useState<string>('body');
  
  const [cssProps, setCssProps] = useState<SectionCSSProperties | null>(null);
  const [customCSS, setCustomCSS] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);

  const extractedFonts = themeData?.theme?.extractedFonts || [];
  const extractedColors = themeData?.theme?.extractedColors || [];

  const previewRef = useRef<HTMLIFrameElement>(null);

  // Initialize state from section data
  useEffect(() => {
    if (section) {
      const props = JSON.parse(JSON.stringify(section.cssProperties)); // Deep copy

      // Ensure defaults
      if (!props.typography.tags) props.typography.tags = {};
      if (!props.spacing.paddingValues) props.spacing.paddingValues = { top: '', right: '', bottom: '', left: '' };
      if (!props.spacing.marginValues) props.spacing.marginValues = { top: '', right: '', bottom: '', left: '' };
      if (!props.effects.animation) {
        props.effects.animation = { name: 'none', duration: '1s', delay: '0s', timingFunction: 'ease' };
      }
      if (!props.buttons) {
        props.buttons = {
          primary: {
            type: 'contained',
            borderRadius: '4px',
            borderWidth: '1px',
            borderColor: 'transparent',
            backgroundColor: themeData?.theme?.globalStyles?.primaryColor || '#3b82f6',
            typography: { fontSize: '16px', fontWeight: '500', lineHeight: '1.5', letterSpacing: 'normal', color: '#ffffff' }
          },
          secondary: {
            type: 'outlined',
            borderRadius: '4px',
            borderWidth: '1px',
            borderColor: themeData?.theme?.globalStyles?.secondaryColor || '#6b7280',
            backgroundColor: 'transparent',
            typography: { fontSize: '16px', fontWeight: '500', lineHeight: '1.5', letterSpacing: 'normal', color: themeData?.theme?.globalStyles?.secondaryColor || '#6b7280' }
          }
        };
      }

      setCssProps(props);
      setCustomCSS(section.customCSS || '');
      setHtmlContent(section.htmlContent || '');
    }
  }, [section, themeData]);

  // Handle iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin && event.origin !== 'null') return;
      if (event.data && event.data.type === 'HTML_UPDATE') {
        setHtmlContent(event.data.html);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update CSS in iframe
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
        data: { cssProperties: cssProps, customCSS, htmlContent },
      });
      alert('Section saved successfully!');
    } catch (error) {
      alert('Failed to save section');
    }
  };

  const generateBootstrapCSS = () => {
    if (!cssProps) return '';
    const { colors, typography, spacing, borders, effects } = cssProps;
    const style = (prop: string, val: string | undefined) => val ? `${prop}: ${val} !important;` : '';

    let css = `
      #content-root {
        width: 100%;
        position: relative;
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
        margin-left: auto;
        margin-right: auto;
        ${style('border-radius', borders.radius)}
        ${style('border-width', borders.width)}
        ${style('border-style', borders.style)}
        ${style('border-color', colors.border)}
        ${style('box-shadow', effects.shadow)}
        ${style('transition', effects.transition || 'all 0.3s ease')}
      }
    `;

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

    // Button Styles
    if (cssProps.buttons) {
      const { primary, secondary } = cssProps.buttons;

      // Primary Button
      css += `
        #content-root .btn-primary, #content-root button.primary, #content-root a.btn-primary {
          background-color: ${primary.backgroundColor} !important;
          border-radius: ${primary.borderRadius} !important;
          border-width: ${primary.borderWidth} !important;
          border-color: ${primary.borderColor} !important;
          border-style: ${primary.type === 'outlined' ? 'solid' : 'none'} !important;
          color: ${primary.typography.color} !important;
          font-size: ${primary.typography.fontSize} !important;
          font-weight: ${primary.typography.fontWeight} !important;
          padding: 0.75rem 1.5rem !important;
          transition: all 0.3s ease !important;
        }
        #content-root .btn-primary:hover, #content-root button.primary:hover, #content-root a.btn-primary:hover {
          opacity: 0.9 !important;
          transform: translateY(-1px) !important;
        }
      `;

      // Secondary Button
      css += `
        #content-root .btn-secondary, #content-root button.secondary, #content-root a.btn-secondary {
          background-color: ${secondary.backgroundColor} !important;
          border-radius: ${secondary.borderRadius} !important;
          border-width: ${secondary.borderWidth} !important;
          border-color: ${secondary.borderColor} !important;
          border-style: ${secondary.type === 'outlined' ? 'solid' : 'none'} !important;
          color: ${secondary.typography.color} !important;
          font-size: ${secondary.typography.fontSize} !important;
          font-weight: ${secondary.typography.fontWeight} !important;
          padding: 0.75rem 1.5rem !important;
          transition: all 0.3s ease !important;
        }
        #content-root .btn-secondary:hover, #content-root button.secondary:hover, #content-root a.btn-secondary:hover {
          opacity: 0.9 !important;
          transform: translateY(-1px) !important;
          background-color: ${secondary.type === 'outlined' ? 'rgba(0,0,0,0.05)' : secondary.backgroundColor} !important;
        }
      `;
    }

    // Animation Keyframes
    if (effects.animation && effects.animation.name !== 'none') {
      const { name, duration, delay, timingFunction } = effects.animation;

      let keyframes = '';
      switch (name) {
        case 'fadeIn':
          keyframes = `
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `;
          break;
        case 'slideUp':
          keyframes = `
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `;
          break;
        case 'scaleIn':
          keyframes = `
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
          `;
          break;
      }

      css += `
        ${keyframes}
        #content-root {
          animation: ${name} ${duration} ${timingFunction || 'ease'} ${delay || '0s'} forwards !important;
        }
      `;
    }

    css += `
      ${customCSS}
    `;

    return css;
  };

  if (isLoading || !cssProps) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Extract body content if it's a full HTML document
  const getBodyContent = (html: string) => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : html;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <PlatformSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col gap-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Home className="w-3.5 h-3.5" />
            <span className="text-slate-300">/</span>
            <span>Theme</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Css Builder</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Builder {section?.name}</h1>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                Manage Sections
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              <button 
                onClick={() => setShowHtmlEditor(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Code className="w-4 h-4 text-slate-500" />
                Edit HTML
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow transition-all"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Builder Workspace */}
        <div className="flex-1 flex overflow-hidden">

          {/* Preview Area */}
          <div className="flex-1 bg-slate-100/50 p-8 overflow-auto flex flex-col items-center relative">
            {/* Viewport Controls */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-sm border border-slate-200 p-1 flex gap-1 z-10">
              <button 
                onClick={() => setViewport('desktop')}
                className={`p-2 rounded-md transition-all ${viewport === 'desktop' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewport('tablet')}
                className={`p-2 rounded-md transition-all ${viewport === 'tablet' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewport('mobile')}
                className={`p-2 rounded-md transition-all ${viewport === 'mobile' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Iframe Container */}
            <div 
              className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-500 ease-in-out mt-12"
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
                        ${themeData?.theme?.extractedCss || ''}
                      </style>
                      <style id="generated-css">
                        ${generateBootstrapCSS()}
                      </style>
                      <script>
                        document.addEventListener('click', (e) => {
                          const target = e.target;
                          if (target.tagName === 'A') e.preventDefault();
                        });
                      </script>
                    </head>
                    <body>
                      <div id="content-root">
                        ${getBodyContent(htmlContent)}
                      </div>
                    </body>
                  </html>
                `}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                title="Preview"
              />
            </div>
          </div>

          {/* Right Sidebar Controls */}
          <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto custom-scrollbar">

            {/* Buttons */}
            <AccordionItem title="Buttons" icon={MousePointer} defaultOpen>
              <div className="space-y-5 pt-2">
                <div className="flex p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setActiveButtonTab('primary')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeButtonTab === 'primary' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Primary
                  </button>
                  <button
                    onClick={() => setActiveButtonTab('secondary')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeButtonTab === 'secondary' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Secondary
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Button Type */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Type</label>
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
                    >
                      <option value="contained">Contained</option>
                      <option value="outlined">Outlined</option>
                      <option value="text">Text</option>
                    </select>
                  </div>

                  {/* Button Color */}
                   <ColorPickerField
                    label="Background"
                    value={cssProps.buttons?.[activeButtonTab].backgroundColor || 'transparent'}
                    onChange={(val) => setCssProps({
                      ...cssProps,
                      buttons: { ...cssProps.buttons!, [activeButtonTab]: { ...cssProps.buttons![activeButtonTab], backgroundColor: val } }
                    })}
                    presetColors={extractedColors}
                  />

                  {/* Corner Radius */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Radius</label>
                      <span className="text-xs text-slate-400">{parseInt(cssProps.buttons?.[activeButtonTab].borderRadius || '0')}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={parseInt(cssProps.buttons?.[activeButtonTab].borderRadius || '0') || 0}
                      onChange={(e) => setCssProps({
                        ...cssProps,
                        buttons: { ...cssProps.buttons!, [activeButtonTab]: { ...cssProps.buttons![activeButtonTab], borderRadius: `${e.target.value}px` } }
                      })}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  {/* Border Width */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Border Width</label>
                      <span className="text-xs text-slate-400">{parseInt(cssProps.buttons?.[activeButtonTab].borderWidth || '0')}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={parseInt(cssProps.buttons?.[activeButtonTab].borderWidth || '0') || 0}
                      onChange={(e) => setCssProps({
                        ...cssProps,
                        buttons: { ...cssProps.buttons!, [activeButtonTab]: { ...cssProps.buttons![activeButtonTab], borderWidth: `${e.target.value}px` } }
                      })}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  {/* Border Color */}
                  <ColorPickerField
                    label="Border Color"
                    value={cssProps.buttons?.[activeButtonTab].borderColor || 'transparent'}
                    onChange={(val) => setCssProps({
                      ...cssProps,
                      buttons: { ...cssProps.buttons!, [activeButtonTab]: { ...cssProps.buttons![activeButtonTab], borderColor: val } }
                    })}
                    presetColors={extractedColors}
                  />

                  {/* Typography Section */}
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Button Typography</label>
                    
                    {/* Font Family */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Font</label>
                      <select
                        value={cssProps.buttons?.[activeButtonTab].typography.fontFamily || 'inherit'}
                        onChange={(e) => setCssProps({
                          ...cssProps,
                          buttons: {
                            ...cssProps.buttons!,
                            [activeButtonTab]: {
                              ...cssProps.buttons![activeButtonTab],
                              typography: { ...cssProps.buttons![activeButtonTab].typography, fontFamily: e.target.value }
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
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
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Font Size */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Size</label>
                        <select
                          value={cssProps.buttons?.[activeButtonTab].typography.fontSize || '16px'}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            buttons: {
                              ...cssProps.buttons!,
                              [activeButtonTab]: {
                                ...cssProps.buttons![activeButtonTab],
                                typography: { ...cssProps.buttons![activeButtonTab].typography, fontSize: e.target.value }
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
                        >
                          {[12, 14, 16, 18, 20, 24, 30, 36].map(size => (
                            <option key={size} value={`${size}px`}>{size}px</option>
                          ))}
                        </select>
                      </div>

                      {/* Font Weight */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Weight</label>
                        <select
                          value={cssProps.buttons?.[activeButtonTab].typography.fontWeight || '400'}
                          onChange={(e) => setCssProps({
                            ...cssProps,
                            buttons: {
                              ...cssProps.buttons!,
                              [activeButtonTab]: {
                                ...cssProps.buttons![activeButtonTab],
                                typography: { ...cssProps.buttons![activeButtonTab].typography, fontWeight: e.target.value }
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
                        >
                          <option value="300">Light</option>
                          <option value="400">Regular</option>
                          <option value="500">Medium</option>
                          <option value="600">Semi Bold</option>
                          <option value="700">Bold</option>
                        </select>
                      </div>
                    </div>

                    {/* Formatting */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Formatting</label>
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
                          className={`flex-1 py-1.5 border rounded text-xs font-bold transition-colors ${
                            cssProps.buttons?.[activeButtonTab].typography.fontWeight === '700' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          B
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
                          className={`flex-1 py-1.5 border rounded text-xs underline transition-colors ${
                            cssProps.buttons?.[activeButtonTab].typography.textDecoration === 'underline' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          U
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
                                  fontFamily: 'italic' // Note: This is a simplification, usually font-style
                                }
                              }
                            }
                          })}
                          className="flex-1 py-1.5 border border-slate-200 rounded text-xs italic text-slate-600 hover:bg-slate-50"
                        >
                          I
                        </button>
                      </div>
                    </div>

                    {/* Font Color */}
                    <ColorPickerField
                      label="Text Color"
                      value={cssProps.buttons?.[activeButtonTab].typography.color || '#000000'}
                      onChange={(val) => setCssProps({
                        ...cssProps,
                        buttons: {
                          ...cssProps.buttons!,
                          [activeButtonTab]: {
                            ...cssProps.buttons![activeButtonTab],
                            typography: { ...cssProps.buttons![activeButtonTab].typography, color: val }
                          }
                        }
                      })}
                      presetColors={extractedColors}
                    />
                  </div>
                </div>
              </div>
            </AccordionItem>

            {/* Spacing */}
            <AccordionItem title="Spacing" icon={Layout}>
               <div className="space-y-4 pt-2">
                 {/* Page Width */}
                 <div>
                   <div className="flex justify-between mb-1.5">
                     <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Page Width</label>
                     <span className="text-xs text-slate-400">{parseInt(cssProps.spacing.pageWidth || '1200')}px</span>
                   </div>
                   <input
                     type="range"
                     min="320"
                     max="1920"
                     value={parseInt(cssProps.spacing.pageWidth || '1200') || 1200}
                     onChange={(e) => setCssProps({
                       ...cssProps,
                       spacing: { ...cssProps.spacing, pageWidth: `${e.target.value}px` }
                     })}
                     className="w-full accent-blue-600"
                   />
                 </div>

                 {/* Padding */}
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Padding</label>
                   <div className="grid grid-cols-2 gap-2 mb-2">
                     <div className="relative">
                       <input
                         type="text"
                         value={cssProps.spacing.paddingValues?.top || ''}
                         onChange={(e) => {
                           const currentPadding = cssProps.spacing.paddingValues || defaultBoxModel;
                           setCssProps({
                             ...cssProps,
                             spacing: {
                               ...cssProps.spacing,
                               paddingValues: { ...currentPadding, top: e.target.value }
                             }
                           });
                         }}
                         className="w-full px-2 py-1.5 pl-6 border border-slate-200 rounded text-sm"
                         placeholder="0"
                       />
                       <span className="absolute left-2 top-1.5 text-xs text-slate-400">T</span>
                     </div>
                     <div className="relative">
                       <input
                         type="text"
                         value={cssProps.spacing.paddingValues?.right || ''}
                         onChange={(e) => {
                           const currentPadding = cssProps.spacing.paddingValues || defaultBoxModel;
                           setCssProps({
                             ...cssProps,
                             spacing: {
                               ...cssProps.spacing,
                               paddingValues: { ...currentPadding, right: e.target.value }
                             }
                           });
                         }}
                         className="w-full px-2 py-1.5 pl-6 border border-slate-200 rounded text-sm"
                         placeholder="0"
                       />
                       <span className="absolute left-2 top-1.5 text-xs text-slate-400">R</span>
                     </div>
                     <div className="relative">
                       <input
                         type="text"
                         value={cssProps.spacing.paddingValues?.bottom || ''}
                         onChange={(e) => {
                           const currentPadding = cssProps.spacing.paddingValues || defaultBoxModel;
                           setCssProps({
                             ...cssProps,
                             spacing: {
                               ...cssProps.spacing,
                               paddingValues: { ...currentPadding, bottom: e.target.value }
                             }
                           });
                         }}
                         className="w-full px-2 py-1.5 pl-6 border border-slate-200 rounded text-sm"
                         placeholder="0"
                       />
                       <span className="absolute left-2 top-1.5 text-xs text-slate-400">B</span>
                     </div>
                     <div className="relative">
                       <input
                         type="text"
                         value={cssProps.spacing.paddingValues?.left || ''}
                         onChange={(e) => {
                           const currentPadding = cssProps.spacing.paddingValues || defaultBoxModel;
                           setCssProps({
                             ...cssProps,
                             spacing: {
                               ...cssProps.spacing,
                               paddingValues: { ...currentPadding, left: e.target.value }
                             }
                           });
                         }}
                         className="w-full px-2 py-1.5 pl-6 border border-slate-200 rounded text-sm"
                         placeholder="0"
                       />
                       <span className="absolute left-2 top-1.5 text-xs text-slate-400">L</span>
                     </div>
                   </div>
                 </div>

                 {/* Margin */}
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Margin</label>
                   <div className="grid grid-cols-2 gap-2">
                     <div className="relative">
                       <input
                         type="text"
                         value={cssProps.spacing.marginValues?.top || ''}
                         onChange={(e) => {
                           const currentMargin = cssProps.spacing.marginValues || defaultBoxModel;
                           setCssProps({
                             ...cssProps,
                             spacing: {
                               ...cssProps.spacing,
                               marginValues: { ...currentMargin, top: e.target.value }
                             }
                           });
                         }}
                         className="w-full px-2 py-1.5 pl-6 border border-slate-200 rounded text-sm"
                         placeholder="0"
                       />
                       <span className="absolute left-2 top-1.5 text-xs text-slate-400">T</span>
                     </div>
                     <div className="relative">
                       <input
                         type="text"
                         value={cssProps.spacing.marginValues?.right || ''}
                         onChange={(e) => {
                           const currentMargin = cssProps.spacing.marginValues || defaultBoxModel;
                           setCssProps({
                             ...cssProps,
                             spacing: {
                               ...cssProps.spacing,
                               marginValues: { ...currentMargin, right: e.target.value }
                             }
                           });
                         }}
                         className="w-full px-2 py-1.5 pl-6 border border-slate-200 rounded text-sm"
                         placeholder="0"
                       />
                       <span className="absolute left-2 top-1.5 text-xs text-slate-400">R</span>
                     </div>
                     <div className="relative">
                       <input
                         type="text"
                         value={cssProps.spacing.marginValues?.bottom || ''}
                         onChange={(e) => {
                           const currentMargin = cssProps.spacing.marginValues || defaultBoxModel;
                           setCssProps({
                             ...cssProps,
                             spacing: {
                               ...cssProps.spacing,
                               marginValues: { ...currentMargin, bottom: e.target.value }
                             }
                           });
                         }}
                         className="w-full px-2 py-1.5 pl-6 border border-slate-200 rounded text-sm"
                         placeholder="0"
                       />
                       <span className="absolute left-2 top-1.5 text-xs text-slate-400">B</span>
                     </div>
                     <div className="relative">
                       <input
                         type="text"
                         value={cssProps.spacing.marginValues?.left || ''}
                         onChange={(e) => {
                           const currentMargin = cssProps.spacing.marginValues || defaultBoxModel;
                           setCssProps({
                             ...cssProps,
                             spacing: {
                               ...cssProps.spacing,
                               marginValues: { ...currentMargin, left: e.target.value }
                             }
                           });
                         }}
                         className="w-full px-2 py-1.5 pl-6 border border-slate-200 rounded text-sm"
                         placeholder="0"
                       />
                       <span className="absolute left-2 top-1.5 text-xs text-slate-400">L</span>
                     </div>
                   </div>
                 </div>
               </div>
            </AccordionItem>

            {/* Typography */}
            <AccordionItem title="Typography" icon={Type}>
               <div className="space-y-4 pt-2">
                 {/* Tag Selector */}
                 <select
                    value={activeTypographyTab}
                    onChange={(e) => setActiveTypographyTab(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white font-medium text-slate-700"
                 >
                   {['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(tag => (
                     <option key={tag} value={tag}>{tag === 'body' ? 'Body Text' : tag.toUpperCase()}</option>
                   ))}
                 </select>

                 {/* Font Family */}
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1.5">Font</label>
                   <select
                      value={cssProps.typography.tags?.[activeTypographyTab]?.fontFamily || 'inherit'}
                      onChange={(e) => {
                        const currentTag = cssProps.typography.tags?.[activeTypographyTab] || defaultTypographyStyle;
                        setCssProps({
                          ...cssProps,
                          typography: {
                            ...cssProps.typography,
                            tags: {
                              ...cssProps.typography.tags,
                              [activeTypographyTab]: { ...currentTag, fontFamily: e.target.value }
                            }
                          }
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
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
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   {/* Font Size */}
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1.5">Size</label>
                     <input 
                        type="text"
                        value={cssProps.typography.tags?.[activeTypographyTab]?.fontSize || ''}
                        onChange={(e) => {
                          const currentTag = cssProps.typography.tags?.[activeTypographyTab] || defaultTypographyStyle;
                          setCssProps({
                            ...cssProps,
                            typography: {
                              ...cssProps.typography,
                              tags: {
                                ...cssProps.typography.tags,
                                [activeTypographyTab]: { ...currentTag, fontSize: e.target.value }
                              }
                            }
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        placeholder="16px"
                     />
                   </div>
                   {/* Font Weight */}
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1.5">Weight</label>
                     <select 
                        value={cssProps.typography.tags?.[activeTypographyTab]?.fontWeight || '400'}
                        onChange={(e) => {
                          const currentTag = cssProps.typography.tags?.[activeTypographyTab] || defaultTypographyStyle;
                          setCssProps({
                            ...cssProps,
                            typography: {
                              ...cssProps.typography,
                              tags: {
                                ...cssProps.typography.tags,
                                [activeTypographyTab]: { ...currentTag, fontWeight: e.target.value }
                              }
                            }
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
                     >
                       <option value="300">Light</option>
                       <option value="400">Regular</option>
                       <option value="500">Medium</option>
                       <option value="600">SemiBold</option>
                       <option value="700">Bold</option>
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   {/* Letter Spacing */}
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1.5">Spacing</label>
                     <select 
                        value={cssProps.typography.tags?.[activeTypographyTab]?.letterSpacing || 'normal'}
                        onChange={(e) => {
                          const currentTag = cssProps.typography.tags?.[activeTypographyTab] || defaultTypographyStyle;
                          setCssProps({
                            ...cssProps,
                            typography: {
                              ...cssProps.typography,
                              tags: {
                                ...cssProps.typography.tags,
                                [activeTypographyTab]: { ...currentTag, letterSpacing: e.target.value }
                              }
                            }
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
                     >
                       <option value="normal">Normal</option>
                       <option value="-1px">-1px</option>
                       <option value="1px">1px</option>
                       <option value="2px">2px</option>
                     </select>
                   </div>
                   {/* Line Height */}
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1.5">Height</label>
                     <select 
                        value={cssProps.typography.tags?.[activeTypographyTab]?.lineHeight || 'normal'}
                        onChange={(e) => {
                          const currentTag = cssProps.typography.tags?.[activeTypographyTab] || defaultTypographyStyle;
                          setCssProps({
                            ...cssProps,
                            typography: {
                              ...cssProps.typography,
                              tags: {
                                ...cssProps.typography.tags,
                                [activeTypographyTab]: { ...currentTag, lineHeight: e.target.value }
                              }
                            }
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
                     >
                       <option value="normal">Normal</option>
                       <option value="1">1</option>
                       <option value="1.2">1.2</option>
                       <option value="1.5">1.5</option>
                       <option value="2">2</option>
                     </select>
                   </div>
                 </div>

                 {/* Formatting */}
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1.5">Formatting</label>
                   <div className="flex gap-2">
                     <button
                       onClick={() => {
                         const currentTag = cssProps.typography.tags?.[activeTypographyTab] || defaultTypographyStyle;
                         setCssProps({
                           ...cssProps,
                           typography: {
                             ...cssProps.typography,
                             tags: {
                               ...cssProps.typography.tags,
                               [activeTypographyTab]: { 
                                 ...currentTag, 
                                 fontWeight: currentTag.fontWeight === '700' ? '400' : '700' 
                               }
                             }
                           }
                         });
                       }}
                       className={`flex-1 py-1.5 border rounded text-xs font-bold transition-colors ${
                         cssProps.typography.tags?.[activeTypographyTab]?.fontWeight === '700' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                       }`}
                     >
                       B
                     </button>
                     <button
                       onClick={() => {
                         const currentTag = cssProps.typography.tags?.[activeTypographyTab] || defaultTypographyStyle;
                         setCssProps({
                           ...cssProps,
                           typography: {
                             ...cssProps.typography,
                             tags: {
                               ...cssProps.typography.tags,
                               [activeTypographyTab]: { 
                                 ...currentTag, 
                                 textDecoration: currentTag.textDecoration === 'underline' ? 'none' : 'underline' 
                               }
                             }
                           }
                         });
                       }}
                       className={`flex-1 py-1.5 border rounded text-xs underline transition-colors ${
                         cssProps.typography.tags?.[activeTypographyTab]?.textDecoration === 'underline' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                       }`}
                     >
                       U
                     </button>
                     <button
                       onClick={() => {
                         const currentTag = cssProps.typography.tags?.[activeTypographyTab] || defaultTypographyStyle;
                         setCssProps({
                           ...cssProps,
                           typography: {
                             ...cssProps.typography,
                             tags: {
                               ...cssProps.typography.tags,
                               [activeTypographyTab]: { 
                                 ...currentTag, 
                                 fontFamily: 'italic' // Simplified
                               }
                             }
                           }
                         });
                       }}
                       className="flex-1 py-1.5 border border-slate-200 rounded text-xs italic text-slate-600 hover:bg-slate-50"
                     >
                       I
                     </button>
                   </div>
                 </div>

                 {/* Font Color */}
                 <ColorPickerField
                    label="Text Color"
                    value={cssProps.typography.tags?.[activeTypographyTab]?.color || '#000000'}
                    onChange={(val) => {
                      const currentTag = cssProps.typography.tags?.[activeTypographyTab] || defaultTypographyStyle;
                      setCssProps({
                        ...cssProps,
                        typography: {
                          ...cssProps.typography,
                          tags: {
                            ...cssProps.typography.tags,
                            [activeTypographyTab]: { ...currentTag, color: val }
                          }
                        }
                      });
                    }}
                    presetColors={extractedColors}
                 />
               </div>
            </AccordionItem>

            {/* Background */}
            <AccordionItem title="Background" icon={Palette}>
               <div className="pt-2">
                 <ColorPickerField
                    label="Background Color"
                    value={cssProps.colors.background}
                    onChange={(val) => setCssProps({ ...cssProps, colors: { ...cssProps.colors, background: val } })}
                    presetColors={extractedColors}
                  />
               </div>
            </AccordionItem>

            {/* Borders */}
            <AccordionItem title="Borders" icon={Box}>
               <div className="pt-2 space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">Radius</label>
                     <input 
                        type="text"
                        value={cssProps.borders.radius}
                        onChange={(e) => setCssProps({ ...cssProps, borders: { ...cssProps.borders, radius: e.target.value } })}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                        placeholder="0px"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">Width</label>
                     <input 
                        type="text"
                        value={cssProps.borders.width}
                        onChange={(e) => setCssProps({ ...cssProps, borders: { ...cssProps.borders, width: e.target.value } })}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                        placeholder="0px"
                     />
                   </div>
                 </div>

                 {/* Border Color */}
                 <ColorPickerField
                    label="Border Color"
                    value={cssProps.borders.color || 'transparent'}
                    onChange={(val) => setCssProps({ ...cssProps, borders: { ...cssProps.borders, color: val } })}
                    presetColors={extractedColors}
                 />
               </div>
            </AccordionItem>

            {/* Effects */}
            <AccordionItem title="Effects" icon={Zap}>
               <div className="pt-2 space-y-4">
                 {/* Shadow */}
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1.5">Shadow</label>
                   <select
                      value={cssProps.effects.shadow}
                      onChange={(e) => setCssProps({ ...cssProps, effects: { ...cssProps.effects, shadow: e.target.value } })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
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
                   <div className="flex justify-between mb-1.5">
                     <label className="block text-xs font-medium text-slate-500">Opacity</label>
                     <span className="text-xs text-slate-400">{parseInt(String(parseFloat(cssProps.effects.opacity || '1') * 100))}%</span>
                   </div>
                   <input
                     type="range"
                     min="0"
                     max="100"
                     value={parseInt(String(parseFloat(cssProps.effects.opacity || '1') * 100)) || 100}
                     onChange={(e) => setCssProps({
                       ...cssProps,
                       effects: { ...cssProps.effects, opacity: String(parseInt(e.target.value) / 100) }
                     })}
                     className="w-full accent-blue-600"
                   />
                 </div>

                 {/* Animation Section */}
                 <div className="border-t border-slate-100 pt-4 space-y-4">
                   <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Animation</label>
                   
                   {/* Animation Name */}
                   <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1.5">Type</label>
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
                       className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
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
                   </div>

                   {/* Animation Speed */}
                   {cssProps.effects.animation?.name && cssProps.effects.animation.name !== 'none' && (
                     <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1.5">Speed</label>
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
                         className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
                       >
                         <option value="4s">Very Slow (4s)</option>
                         <option value="2s">Slow (2s)</option>
                         <option value="1s">Normal (1s)</option>
                         <option value="0.5s">Fast (0.5s)</option>
                         <option value="0.3s">Very Fast (0.3s)</option>
                       </select>
                     </div>
                   )}
                 </div>
               </div>
            </AccordionItem>

             {/* Custom CSS */}
            <AccordionItem title="Custom CSS" icon={Code}>
               <div className="pt-2">
                 <textarea
                    value={customCSS}
                    onChange={(e) => setCustomCSS(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-slate-200 rounded-md text-xs font-mono bg-slate-50 focus:bg-white transition-colors resize-none"
                    placeholder=".my-class { ... }"
                 />
               </div>
            </AccordionItem>

          </div>
        </div>
      </div>

      {/* HTML Editor Modal */}
      <SimpleHtmlEditor
        isOpen={showHtmlEditor}
        onClose={() => setShowHtmlEditor(false)}
        html={htmlContent}
        onSave={(newHtml) => {
          setHtmlContent(newHtml);
          setShowHtmlEditor(false);
        }}
      />
    </div>
  );
}
