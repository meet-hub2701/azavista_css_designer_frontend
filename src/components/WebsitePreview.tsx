'use client';

import { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw } from 'lucide-react';

interface WebsitePreviewProps {
  url: string;
  cssOverride: string;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export default function WebsitePreview({ url, cssOverride }: WebsitePreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const viewportSizes = {
    desktop: { width: '100%', height: '600px', icon: Monitor },
    tablet: { width: '768px', height: '600px', icon: Tablet },
    mobile: { width: '375px', height: '667px', icon: Smartphone },
  };

  const currentSize = viewportSizes[viewport];
  const Icon = currentSize.icon;

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
    setLoadError(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => {
            const SizeIcon = viewportSizes[size].icon;
            return (
              <button
                key={size}
                onClick={() => setViewport(size)}
                className={`p-2 rounded ${
                  viewport === size
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={size}
              >
                <SizeIcon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 rounded bg-gray-100 hover:bg-gray-200"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="border rounded-lg bg-gray-50 p-4 flex justify-center overflow-auto">
        <div
          style={{
            width: currentSize.width,
            height: currentSize.height,
            maxWidth: '100%',
          }}
          className="bg-white rounded shadow-lg overflow-hidden"
        >
          {loadError ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Cannot Load Website</h3>
              <p className="text-gray-600 mb-4">
                This website blocks iframe embedding for security reasons.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Try these alternatives:</p>
                <ul className="list-disc list-inside text-left">
                  <li>Use the browser extension (coming soon)</li>
                  <li>Download the CSS and apply manually</li>
                  <li>Test with a different website</li>
                </ul>
              </div>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <iframe
                key={iframeKey}
                src={url}
                className="w-full h-full"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                onError={() => setLoadError(true)}
                title="Website Preview"
              />
              <style dangerouslySetInnerHTML={{ __html: cssOverride }} />
            </>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>Preview URL: {url}</p>
        <p>Note: CSS injection in iframe is limited by browser security policies. For full theme preview, use the browser extension or download CSS.</p>
      </div>
    </div>
  );
}
