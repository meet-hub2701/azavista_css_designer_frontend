'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface SimpleHtmlEditorProps {
  html: string;
  onSave: (newHtml: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function SimpleHtmlEditor({ html, onSave, onClose, isOpen }: SimpleHtmlEditorProps) {
  if (!isOpen) return null;
  const [editedHtml, setEditedHtml] = useState(html);

  useEffect(() => {
    setEditedHtml(html);
  }, [html]);

  const handleSave = () => {
    onSave(editedHtml);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Edit HTML Content</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Edit the full HTML content including inline styles and structure.
          </p>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4 overflow-auto">
          <textarea
            value={editedHtml}
            onChange={(e) => setEditedHtml(e.target.value)}
            className="w-full h-full min-h-[400px] p-4 border rounded font-mono text-sm"
            placeholder="Edit HTML here..."
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
