'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';

interface EditableContentProps {
  html: string;
  onSave: (newHtml: string) => void;
  className?: string;
}

export default function EditableContent({ html, onSave, className = '' }: EditableContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedHtml, setEditedHtml] = useState(html);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [editText, setEditText] = useState('');
  const [editPosition, setEditPosition] = useState({ top: 0, left: 0 });
  const [renderKey, setRenderKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSavedRef = useRef(false);

  // Fix broken asset URLs by removing them (client-side fallback)
  const fixBrokenAssets = (htmlContent: string): string => {
    // Remove ALL external asset references to prevent 404s and CORS errors
    let fixed = htmlContent;
    
    // Remove entire SVG elements (they often have sprite references)
    fixed = fixed.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
    
    // Remove img tags with any external or relative URLs
    fixed = fixed.replace(/<img[^>]*>/gi, '');
    
    // Remove link tags for stylesheets and fonts
    fixed = fixed.replace(/<link[^>]*>/gi, '');
    
    // Remove script tags
    fixed = fixed.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Remove style tags with @font-face (causes CORS errors)
    fixed = fixed.replace(/<style[^>]*>[\s\S]*?@font-face[\s\S]*?<\/style>/gi, '');
    
    // Remove inline styles with url() references
    fixed = fixed.replace(/style=["'][^"']*url\([^)]*\)[^"']*["']/gi, '');
    
    return fixed;
  };

  useEffect(() => {
    console.log('HTML prop changed, length:', html.length);
    
    // Don't update if we just saved (prevents overwriting user changes)
    if (justSavedRef.current) {
      console.log('Skipping HTML update - just saved');
      justSavedRef.current = false;
      return;
    }
    
    const cleanedHtml = fixBrokenAssets(html);
    setEditedHtml(cleanedHtml);
    
    // Update the container directly if it exists
    if (containerRef.current && cleanedHtml) {
      console.log('Updating container innerHTML');
      containerRef.current.innerHTML = cleanedHtml;
    }
  }, [html]);

  // Suppress 404 errors for missing assets from extracted websites
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      // Suppress specific 404 errors for assets
      if (args[0]?.includes?.('404') || args[0]?.includes?.('ERR_ABORTED')) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleElementClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    console.log('Clicked element:', target.tagName, target.textContent?.substring(0, 50));
    
    // Don't prevent default or stop propagation - let the click through
    
    // Check if clicked element is editable (text content)
    const editableElements = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'BUTTON', 'LI', 'DIV', 'TD', 'TH'];
    
    if (editableElements.includes(target.tagName) && target.textContent && target.textContent.trim()) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Element is editable, showing editor');
      
      setSelectedElement(target);
      setEditText(target.textContent.trim());
      
      // Get position for edit popup
      const rect = target.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      if (containerRect) {
        setEditPosition({
          top: rect.top - containerRect.top + rect.height + 5,
          left: rect.left - containerRect.left,
        });
      }
      
      setIsEditing(true);
      
      // Highlight the element
      target.style.outline = '2px solid #3b82f6';
      target.style.outlineOffset = '2px';
      target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    } else {
      console.log('Element not editable or no text content');
    }
  };

  const handleSave = () => {
    console.log('Saving text:', editText);
    
    if (selectedElement && editText.trim()) {
      // Update the text content directly in the DOM
      selectedElement.textContent = editText.trim();
      
      // Remove highlight
      selectedElement.style.outline = '';
      selectedElement.style.outlineOffset = '';
      selectedElement.style.backgroundColor = '';
      
      // Get the updated HTML from the container
      if (containerRef.current) {
        const newHtml = containerRef.current.innerHTML;
        console.log('New HTML length:', newHtml.length);
        console.log('Text changed to:', editText);
        
        // Mark that we just saved to prevent useEffect from overwriting
        justSavedRef.current = true;
        
        // Update local state
        setEditedHtml(newHtml);
        
        // Notify parent (this will save to database when user clicks "Save Changes")
        onSave(newHtml);
        
        console.log('Save complete - text should be visible now');
      }
    }
    
    setIsEditing(false);
    setSelectedElement(null);
  };

  const handleCancel = () => {
    console.log('Canceling edit');
    if (selectedElement) {
      selectedElement.style.outline = '';
      selectedElement.style.outlineOffset = '';
      selectedElement.style.backgroundColor = '';
    }
    setIsEditing(false);
    setSelectedElement(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  console.log('EditableContent rendering, HTML length:', editedHtml.length, 'isEditing:', isEditing);
  console.log('HTML preview:', editedHtml.substring(0, 200));

  return (
    <div className={`relative ${className}`}>
      {editedHtml.length === 0 && (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          No HTML content available. Extract a website first.
        </div>
      )}
      
      {/* Editable Content */}
      <div
        ref={(el) => {
          if (el && !containerRef.current) {
            // First render - set the HTML
            el.innerHTML = editedHtml;
          }
          (containerRef as any).current = el;
        }}
        className="cursor-pointer hover:bg-blue-50/30 transition border-2 border-dashed border-blue-300"
        onClick={(e) => {
          console.log('DIV CLICKED!', e.target);
          handleElementClick(e);
        }}
        style={{ 
          minHeight: '100px',
          maxWidth: '100%',
          overflow: 'hidden',
          position: 'relative',
          padding: '10px',
          pointerEvents: 'auto'
        }}
        title="Click on any text to edit"
      />

      {/* Edit Tooltip */}
      {!isEditing && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition pointer-events-none">
          <Edit2 className="w-3 h-3" />
          Click text to edit
        </div>
      )}

      {/* Edit Popup */}
      {isEditing && (
        <div
          className="absolute z-50 bg-white rounded-lg shadow-lg border-2 border-blue-600 p-3 min-w-[300px]"
          style={{
            top: `${editPosition.top}px`,
            left: `${editPosition.left}px`,
          }}
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Edit text..."
            />
            <button
              onClick={handleSave}
              className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
              title="Save (Enter)"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
              title="Cancel (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to save, Esc to cancel
          </p>
        </div>
      )}
    </div>
  );
}
