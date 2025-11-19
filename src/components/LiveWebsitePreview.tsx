'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, RefreshCw, Download, Monitor, Tablet, Smartphone } from 'lucide-react';

interface LiveWebsitePreviewProps {
  cssProperties: any;
  customCSS?: string;
  onExportCSS: () => void;
  onExportJSON: () => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export default function LiveWebsitePreview({ 
  cssProperties, 
  customCSS = '',
  onExportCSS,
  onExportJSON 
}: LiveWebsitePreviewProps) {
  const [url, setUrl] = useState('');
  const [loadedUrl, setLoadedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [showBootstrapPreview, setShowBootstrapPreview] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const viewportSizes = {
    desktop: { width: '100%', height: '100%', icon: Monitor },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    mobile: { width: '375px', height: '667px', icon: Smartphone },
  };

  const generateCSS = () => {
    if (!cssProperties) return '';
    
    return `
/* Generated Theme CSS */
:root {
  --primary-color: ${cssProperties.colors.background};
  --text-color: ${cssProperties.colors.text};
  --border-color: ${cssProperties.colors.border};
  --hover-color: ${cssProperties.colors.hover};
  --font-size: ${cssProperties.typography.fontSize};
  --font-weight: ${cssProperties.typography.fontWeight};
  --line-height: ${cssProperties.typography.lineHeight};
  --border-radius: ${cssProperties.borders.radius};
  --box-shadow: ${cssProperties.effects.shadow};
}

/* Apply to all elements */
* {
  font-family: ${cssProperties.typography.fontFamily || 'inherit'} !important;
}

/* Buttons */
button, .btn, input[type="button"], input[type="submit"] {
  background-color: ${cssProperties.colors.background} !important;
  color: ${cssProperties.colors.text} !important;
  border: ${cssProperties.borders.width} ${cssProperties.borders.style} ${cssProperties.colors.border} !important;
  border-radius: ${cssProperties.borders.radius} !important;
  padding: ${cssProperties.spacing.padding} !important;
  font-size: ${cssProperties.typography.fontSize} !important;
  font-weight: ${cssProperties.typography.fontWeight} !important;
  transition: ${cssProperties.effects.transition} !important;
  box-shadow: ${cssProperties.effects.shadow} !important;
}

button:hover, .btn:hover {
  background-color: ${cssProperties.colors.hover} !important;
  transform: ${cssProperties.effects.transform || 'none'} !important;
}

/* Cards */
.card, .card-body {
  background-color: ${cssProperties.colors.background} !important;
  border: ${cssProperties.borders.width} ${cssProperties.borders.style} ${cssProperties.colors.border} !important;
  border-radius: ${cssProperties.borders.radius} !important;
  box-shadow: ${cssProperties.effects.shadow} !important;
}

/* Typography */
h1, h2, h3, h4, h5, h6, p, span, div {
  color: ${cssProperties.colors.text} !important;
  line-height: ${cssProperties.typography.lineHeight} !important;
  letter-spacing: ${cssProperties.typography.letterSpacing} !important;
}

/* Forms */
input, textarea, select {
  border: ${cssProperties.borders.width} ${cssProperties.borders.style} ${cssProperties.colors.border} !important;
  border-radius: ${cssProperties.borders.radius} !important;
  padding: ${cssProperties.spacing.padding} !important;
}

/* Custom CSS */
${customCSS}
`.trim();
  };

  const loadWebsite = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setShowBootstrapPreview(false);
    
    try {
      // Fetch website through our proxy with custom CSS
      const response = await fetch('http://localhost:5000/api/proxy/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          customCSS: generateCSS(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to load website');
      }
      
      const html = await response.text();
      
      // Create a blob URL for the HTML
      const blob = new Blob([html], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      
      setLoadedUrl(blobUrl);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load website');
      setIsLoading(false);
    }
  };

  const injectCSS = () => {
    if (!iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (!iframeDoc) return;

      // Remove existing injected styles
      const existingStyle = iframeDoc.getElementById('custom-theme-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Inject new styles
      const style = iframeDoc.createElement('style');
      style.id = 'custom-theme-styles';
      style.textContent = generateCSS();
      iframeDoc.head.appendChild(style);
    } catch (err) {
      console.error('Failed to inject CSS:', err);
    }
  };

  // Reload website when CSS changes
  useEffect(() => {
    if (loadedUrl && !showBootstrapPreview && url) {
      // Debounce the reload
      const timer = setTimeout(() => {
        loadWebsite();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cssProperties, customCSS]);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Controls */}
      <div className="border-b p-4 space-y-3">
        {/* URL Input */}
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <Globe className="w-5 h-5 text-gray-400 mt-2" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadWebsite()}
              placeholder="Enter website URL (e.g., https://example.com)"
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            onClick={loadWebsite}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load Website'}
          </button>
          <button
            onClick={() => {
              setShowBootstrapPreview(true);
              setLoadedUrl('');
            }}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Bootstrap Preview
          </button>
        </div>

        {/* Viewport & Export Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => {
              const Icon = viewportSizes[size].icon;
              return (
                <button
                  key={size}
                  onClick={() => setViewport(size)}
                  className={`p-2 rounded ${
                    viewport === size
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                  title={size}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onExportCSS}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export CSS
            </button>
            <button
              onClick={onExportJSON}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div 
          className="mx-auto bg-white shadow-lg transition-all duration-300"
          style={{
            width: viewportSizes[viewport].width,
            height: viewportSizes[viewport].height,
            maxWidth: '100%',
          }}
        >
          {showBootstrapPreview ? (
            <BootstrapComponentPreview cssProperties={cssProperties} customCSS={customCSS} />
          ) : loadedUrl ? (
            <iframe
              ref={iframeRef}
              src={loadedUrl}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms"
              title="Website Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Globe className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Load a Website to Preview</p>
                <p className="text-sm">Enter a URL above and click "Load Website"</p>
                <p className="text-sm mt-2">Your CSS changes will be applied to the actual website!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BootstrapComponentPreview({ cssProperties, customCSS }: { cssProperties: any; customCSS: string }) {
  return (
    <div className="p-8 overflow-auto h-full">
      <style>{`
        ${generateBootstrapCSS(cssProperties, customCSS)}
      `}</style>
      
      <h1 className="mb-4">Bootstrap Component Preview</h1>
      
      {/* Buttons */}
      <section className="mb-5">
        <h3 className="mb-3">Buttons</h3>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-secondary">Secondary Button</button>
          <button className="btn btn-success">Success Button</button>
          <button className="btn btn-outline-primary">Outline Button</button>
        </div>
      </section>

      {/* Cards */}
      <section className="mb-5">
        <h3 className="mb-3">Cards</h3>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Card Title</h5>
                <p className="card-text">Some quick example text to build on the card title.</p>
                <button className="btn btn-primary">Go somewhere</button>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Another Card</h5>
                <p className="card-text">This is another card with some content.</p>
                <button className="btn btn-secondary">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forms */}
      <section className="mb-5">
        <h3 className="mb-3">Forms</h3>
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
      <section className="mb-5">
        <h3 className="mb-3">Alerts</h3>
        <div className="alert alert-primary">This is a primary alert</div>
        <div className="alert alert-success">This is a success alert</div>
      </section>
    </div>
  );
}

function generateBootstrapCSS(cssProperties: any, customCSS: string) {
  if (!cssProperties) return '';
  
  return `
    .btn, .btn-primary, .btn-secondary, .btn-success {
      background-color: ${cssProperties.colors.background} !important;
      color: ${cssProperties.colors.text} !important;
      border: ${cssProperties.borders.width} ${cssProperties.borders.style} ${cssProperties.colors.border} !important;
      border-radius: ${cssProperties.borders.radius} !important;
      padding: ${cssProperties.spacing.padding} !important;
      font-size: ${cssProperties.typography.fontSize} !important;
      font-weight: ${cssProperties.typography.fontWeight} !important;
      box-shadow: ${cssProperties.effects.shadow} !important;
      transition: ${cssProperties.effects.transition} !important;
    }
    
    .btn:hover {
      background-color: ${cssProperties.colors.hover} !important;
    }
    
    .card {
      border: ${cssProperties.borders.width} ${cssProperties.borders.style} ${cssProperties.colors.border} !important;
      border-radius: ${cssProperties.borders.radius} !important;
      box-shadow: ${cssProperties.effects.shadow} !important;
    }
    
    .form-control {
      border: ${cssProperties.borders.width} ${cssProperties.borders.style} ${cssProperties.colors.border} !important;
      border-radius: ${cssProperties.borders.radius} !important;
      padding: ${cssProperties.spacing.padding} !important;
    }
    
    ${customCSS}
  `;
}
