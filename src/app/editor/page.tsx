'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { analysisAPI } from '@/lib/api';
import type { CSSOverrides } from '../../../../shared/src/types';
import ButtonStylePanel from '@/components/editor/ButtonStylePanel';
import TypographyPanel from '@/components/editor/TypographyPanel';
import SpacingPanel from '@/components/editor/SpacingPanel';
import BackgroundPanel from '@/components/editor/BackgroundPanel';
import BordersPanel from '@/components/editor/BordersPanel';
import EffectsPanel from '@/components/editor/EffectsPanel';
import CustomCSSPanel from '@/components/editor/CustomCSSPanel';

function EditorContent() {
  const router = useRouter();
  const { token, initAuth } = useAuthStore();
  const [url, setUrl] = useState('https://example.com');
  const [themeName, setThemeName] = useState('New Theme');
  const [iframeKey, setIframeKey] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showComparison, setShowComparison] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [iframeError, setIframeError] = useState(false);
  
  const [cssOverrides, setCssOverrides] = useState<CSSOverrides>({
    buttons: {
      primary: {
        type: 'contained',
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 0,
        borderColor: '#3b82f6',
        fontSize: 16,
        fontWeight: 'Regular',
        fontFamily: 'Arial',
        paddingX: 24,
        paddingY: 12,
      },
      secondary: {
        type: 'outlined',
        backgroundColor: 'transparent',
        textColor: '#3b82f6',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#3b82f6',
        fontSize: 16,
        fontWeight: 'Regular',
        fontFamily: 'Arial',
        paddingX: 24,
        paddingY: 12,
      },
    },
    typography: {
      h1: {
        fontSize: 48,
        fontWeight: 'Bold',
        fontFamily: 'Arial',
        color: '#1f2937',
        lineHeight: 1.2,
        letterSpacing: 0,
      },
      h2: {
        fontSize: 36,
        fontWeight: 'Bold',
        fontFamily: 'Arial',
        color: '#1f2937',
        lineHeight: 1.3,
        letterSpacing: 0,
      },
      h3: {
        fontSize: 24,
        fontWeight: 'SemiBold',
        fontFamily: 'Arial',
        color: '#1f2937',
        lineHeight: 1.4,
        letterSpacing: 0,
      },
      body: {
        fontSize: 16,
        fontWeight: 'Regular',
        fontFamily: 'Arial',
        color: '#4b5563',
        lineHeight: 1.6,
        letterSpacing: 0,
      },
    },
    spacing: {
      containerPadding: 16,
      sectionPadding: 64,
      elementMargin: 16,
      gridGap: 24,
    },
    background: {
      bodyBackground: '#ffffff',
      sectionBackground: '#f9fafb',
      cardBackground: '#ffffff',
      useGradient: false,
    },
    borders: {
      cardBorderRadius: 12,
      cardBorderWidth: 1,
      cardBorderColor: '#e5e7eb',
      inputBorderRadius: 8,
      inputBorderWidth: 1,
      inputBorderColor: '#d1d5db',
    },
    effects: {
      cardShadow: '0 4px 6px rgba(0,0,0,0.1)',
      buttonShadow: '0 2px 4px rgba(0,0,0,0.1)',
      hoverTransform: 'translateY(-2px)',
      transitionDuration: 300,
    },
    customCSS: '',
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    buttons: true,
    typography: false,
    spacing: false,
    background: false,
    borders: false,
    effects: false,
    customCSS: false,
  });

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generateCSS = (): string => {
    const { buttons, typography, spacing, background, borders, effects, customCSS } = cssOverrides;
    
    const fontWeightMap: Record<string, number> = {
      'Thin': 100,
      'ExtraLight': 200,
      'Light': 300,
      'Regular': 400,
      'Medium': 500,
      'SemiBold': 600,
      'Bold': 700,
      'ExtraBold': 800,
      'Black': 900,
    };

    return `
/* StyleForge Generated CSS */

/* Body & Background */
body {
  background-color: ${background.bodyBackground} !important;
  font-family: ${typography.body.fontFamily}, sans-serif !important;
  font-size: ${typography.body.fontSize}px !important;
  color: ${typography.body.color} !important;
  line-height: ${typography.body.lineHeight} !important;
  letter-spacing: ${typography.body.letterSpacing}px !important;
  font-weight: ${fontWeightMap[typography.body.fontWeight] || 400} !important;
}

/* Typography */
h1, .h1 {
  font-family: ${typography.h1.fontFamily}, sans-serif !important;
  font-size: ${typography.h1.fontSize}px !important;
  font-weight: ${fontWeightMap[typography.h1.fontWeight] || 700} !important;
  color: ${typography.h1.color} !important;
  line-height: ${typography.h1.lineHeight} !important;
  letter-spacing: ${typography.h1.letterSpacing}px !important;
}

h2, .h2 {
  font-family: ${typography.h2.fontFamily}, sans-serif !important;
  font-size: ${typography.h2.fontSize}px !important;
  font-weight: ${fontWeightMap[typography.h2.fontWeight] || 700} !important;
  color: ${typography.h2.color} !important;
  line-height: ${typography.h2.lineHeight} !important;
  letter-spacing: ${typography.h2.letterSpacing}px !important;
}

h3, .h3 {
  font-family: ${typography.h3.fontFamily}, sans-serif !important;
  font-size: ${typography.h3.fontSize}px !important;
  font-weight: ${fontWeightMap[typography.h3.fontWeight] || 600} !important;
  color: ${typography.h3.color} !important;
  line-height: ${typography.h3.lineHeight} !important;
  letter-spacing: ${typography.h3.letterSpacing}px !important;
}

/* Primary Buttons */
button, .btn, .button, input[type="submit"], input[type="button"] {
  background-color: ${buttons.primary.backgroundColor} !important;
  color: ${buttons.primary.textColor} !important;
  border-radius: ${buttons.primary.borderRadius}px !important;
  border: ${buttons.primary.borderWidth}px solid ${buttons.primary.borderColor} !important;
  font-size: ${buttons.primary.fontSize}px !important;
  font-weight: ${fontWeightMap[buttons.primary.fontWeight] || 400} !important;
  font-family: ${buttons.primary.fontFamily}, sans-serif !important;
  padding: ${buttons.primary.paddingY}px ${buttons.primary.paddingX}px !important;
  box-shadow: ${effects.buttonShadow} !important;
  transition: all ${effects.transitionDuration}ms ease !important;
  cursor: pointer !important;
}

button:hover, .btn:hover, .button:hover {
  transform: ${effects.hoverTransform} !important;
}

/* Secondary Buttons */
.btn-secondary, .button-secondary {
  background-color: ${buttons.secondary.backgroundColor} !important;
  color: ${buttons.secondary.textColor} !important;
  border: ${buttons.secondary.borderWidth}px solid ${buttons.secondary.borderColor} !important;
}

/* Spacing */
.container, .wrapper {
  padding: ${spacing.containerPadding}px !important;
}

section, .section {
  padding: ${spacing.sectionPadding}px 0 !important;
}

/* Backgrounds */
section:nth-child(even), .section-alt {
  background-color: ${background.sectionBackground} !important;
}

/* Cards */
.card, .panel, article {
  background-color: ${background.cardBackground} !important;
  border-radius: ${borders.cardBorderRadius}px !important;
  border: ${borders.cardBorderWidth}px solid ${borders.cardBorderColor} !important;
  box-shadow: ${effects.cardShadow} !important;
  transition: all ${effects.transitionDuration}ms ease !important;
}

.card:hover, .panel:hover, article:hover {
  transform: ${effects.hoverTransform} !important;
}

/* Inputs */
input, textarea, select {
  border-radius: ${borders.inputBorderRadius}px !important;
  border: ${borders.inputBorderWidth}px solid ${borders.inputBorderColor} !important;
  padding: 12px 16px !important;
  font-family: ${typography.body.fontFamily}, sans-serif !important;
  font-size: ${typography.body.fontSize}px !important;
}

input:focus, textarea:focus, select:focus {
  outline: none !important;
  border-color: ${buttons.primary.backgroundColor} !important;
  box-shadow: 0 0 0 3px ${buttons.primary.backgroundColor}33 !important;
}

/* Custom CSS */
${customCSS}
`.trim();
  };

  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);

  const injectCSS = (iframe: HTMLIFrameElement) => {
    if (!iframe || !iframe.contentWindow) return;
    
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc) {
        // Remove old style tag if exists
        const oldStyle = iframeDoc.getElementById('styleforge-custom-css');
        if (oldStyle) oldStyle.remove();
        
        // Inject new styles
        const style = iframeDoc.createElement('style');
        style.id = 'styleforge-custom-css';
        style.textContent = generateCSS();
        iframeDoc.head.appendChild(style);
      }
    } catch (e) {
      console.error('Cannot inject CSS due to CORS policy. The website blocks iframe embedding.');
    }
  };

  const handleApply = () => {
    setIframeKey(prev => prev + 1);
    setIframeError(false);
  };

  const handleAnalyze = async () => {
    if (!url) return;
    setAnalyzing(true);
    try {
      const response = await analysisAPI.analyze(url);
      setAnalysisData(response.data);
      alert(`Analysis complete! Found:\n- ${response.data.elements.buttons.length} buttons\n- ${response.data.elements.headers.length} headers\n- ${response.data.elements.forms.length} forms`);
    } catch (error) {
      alert('Failed to analyze website. The site may block external analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const viewportSizes = {
    desktop: { width: '100%', icon: '🖥️' },
    tablet: { width: '768px', icon: '📱' },
    mobile: { width: '375px', icon: '📱' },
  };

  // Re-inject CSS whenever cssOverrides change
  useEffect(() => {
    if (iframeRef) {
      const timer = setTimeout(() => {
        injectCSS(iframeRef);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [cssOverrides]);

  const handleDownloadCSS = () => {
    const css = generateCSS();
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${themeName.replace(/\s+/g, '-').toLowerCase()}.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!token) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <input
            type="text"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            className="text-xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-purple-600 rounded px-2"
            placeholder="Theme Name"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadCSS}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Download CSS
          </button>
          <button
            onClick={() => alert('Save functionality')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Save className="w-4 h-4" />
            Save Theme
          </button>
        </div>
      </div>

      {/* URL Input & Controls */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Load
          </button>
        </div>
        
        {/* View Mode & Comparison Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <span className="text-sm text-gray-600">View:</span>
            {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === mode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {viewportSizes[mode].icon} {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3 py-1 text-sm rounded ${
              showComparison
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showComparison ? '✓ Comparison Mode' : 'Show Comparison'}
          </button>

          {analysisData && (
            <div className="text-sm text-gray-600">
              Found: {analysisData.elements.buttons.length} buttons, {analysisData.elements.headers.length} headers
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Panel - Left */}
        <div className="flex-1 p-6 overflow-auto bg-gray-100">
          {showComparison ? (
            /* Side-by-side comparison */
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium">
                  Original
                </div>
                <div className="h-[calc(100%-40px)]">
                  <iframe
                    src={url}
                    className="w-full h-full"
                    sandbox="allow-same-origin allow-scripts"
                    title="Original Website"
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-purple-600 text-white px-4 py-2 text-sm font-medium">
                  Styled (Your Theme)
                </div>
                <div className="h-[calc(100%-40px)]">
                  <iframe
                    key={iframeKey}
                    src={url}
                    className="w-full h-full"
                    sandbox="allow-same-origin allow-scripts"
                    title="Styled Website"
                    ref={(iframe) => {
                      if (iframe) {
                        setIframeRef(iframe);
                        iframe.onload = () => injectCSS(iframe);
                        iframe.onerror = () => setIframeError(true);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Single view with viewport sizing */
            <div className="flex justify-center items-start h-full">
              <div 
                className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
                style={{ 
                  width: viewportSizes[viewMode].width,
                  maxWidth: '100%',
                  height: '100%'
                }}
              >
                <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium flex justify-between items-center">
                  <span>Preview: {url}</span>
                  <span className="text-xs opacity-75">{viewMode} view</span>
                </div>
                <div className="h-[calc(100%-40px)] relative">
                  {iframeError ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <div className="text-6xl mb-4">🚫</div>
                      <h3 className="text-xl font-semibold mb-2">Cannot Load Website</h3>
                      <p className="text-gray-600 mb-4">
                        This website blocks iframe embedding (X-Frame-Options).
                      </p>
                      <div className="text-sm text-gray-500 space-y-2">
                        <p>Try these alternatives:</p>
                        <ul className="list-disc list-inside text-left">
                          <li>Use a different website that allows embedding</li>
                          <li>Download the CSS and apply it manually</li>
                          <li>Use browser extension (coming soon)</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => {
                          setIframeError(false);
                          setIframeKey(prev => prev + 1);
                        }}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <iframe
                      key={iframeKey}
                      src={url}
                      className="w-full h-full"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                      title="Website Preview"
                      ref={(iframe) => {
                        if (iframe) {
                          setIframeRef(iframe);
                          iframe.onload = () => {
                            injectCSS(iframe);
                            setIframeError(false);
                          };
                          iframe.onerror = () => setIframeError(true);
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Style Controls - Right */}
        <div className="w-96 bg-white border-l overflow-y-auto">
          <div className="p-4 space-y-2">
            {/* Buttons Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('buttons')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <span className="font-semibold">Buttons</span>
                {expandedSections.buttons ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.buttons && (
                <div className="p-4 border-t">
                  <ButtonStylePanel
                    buttons={cssOverrides.buttons}
                    onChange={(buttons) => setCssOverrides({ ...cssOverrides, buttons })}
                  />
                </div>
              )}
            </div>

            {/* Typography Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('typography')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <span className="font-semibold">Typography</span>
                {expandedSections.typography ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.typography && (
                <div className="p-4 border-t">
                  <TypographyPanel
                    typography={cssOverrides.typography}
                    onChange={(typography) => setCssOverrides({ ...cssOverrides, typography })}
                  />
                </div>
              )}
            </div>

            {/* Spacing Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('spacing')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <span className="font-semibold">Spacing</span>
                {expandedSections.spacing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.spacing && (
                <div className="p-4 border-t">
                  <SpacingPanel
                    spacing={cssOverrides.spacing}
                    onChange={(spacing) => setCssOverrides({ ...cssOverrides, spacing })}
                  />
                </div>
              )}
            </div>

            {/* Background Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('background')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <span className="font-semibold">Background</span>
                {expandedSections.background ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.background && (
                <div className="p-4 border-t">
                  <BackgroundPanel
                    background={cssOverrides.background}
                    onChange={(background) => setCssOverrides({ ...cssOverrides, background })}
                  />
                </div>
              )}
            </div>

            {/* Borders Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('borders')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <span className="font-semibold">Borders</span>
                {expandedSections.borders ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.borders && (
                <div className="p-4 border-t">
                  <BordersPanel
                    borders={cssOverrides.borders}
                    onChange={(borders) => setCssOverrides({ ...cssOverrides, borders })}
                  />
                </div>
              )}
            </div>

            {/* Effects Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('effects')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <span className="font-semibold">Effects</span>
                {expandedSections.effects ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.effects && (
                <div className="p-4 border-t">
                  <EffectsPanel
                    effects={cssOverrides.effects}
                    onChange={(effects) => setCssOverrides({ ...cssOverrides, effects })}
                  />
                </div>
              )}
            </div>

            {/* Custom CSS Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('customCSS')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <span className="font-semibold">Custom CSS</span>
                {expandedSections.customCSS ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.customCSS && (
                <div className="p-4 border-t">
                  <CustomCSSPanel
                    customCSS={cssOverrides.customCSS}
                    onChange={(customCSS) => setCssOverrides({ ...cssOverrides, customCSS })}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Editor() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
