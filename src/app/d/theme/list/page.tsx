'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useThemes, useDeleteTheme, useDuplicateTheme, useCreateTheme } from '@/hooks/useThemes';
import { themeAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';

export default function ThemeListPage() {
  const router = useRouter();
  const { data: themes, isLoading } = useThemes();
  const deleteTheme = useDeleteTheme();
  const duplicateTheme = useDuplicateTheme();
  const createTheme = useCreateTheme();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this theme?')) return;
    try {
      await deleteTheme.mutateAsync(id);
    } catch (error) {
      alert('Failed to delete theme');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateTheme.mutateAsync(id);
    } catch (error) {
      alert('Failed to duplicate theme');
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-end gap-3">
          <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50">
            Platform Theme Switcher
          </button>
          <button
            onClick={() => setShowUrlModal(true)}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            From URL
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Theme
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="w-12 px-6 py-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Style Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Edited
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {themes?.map((theme) => (
                    <tr
                      key={theme._id}
                      className="hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => router.push(`/d/theme/section-list/${theme._id}`)}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">css</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{theme.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">website</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(theme.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="border-t px-6 py-3 flex items-center justify-end bg-white">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700">
                    1-{themes?.length || 0} of {themes?.length || 0}
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create from URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create Theme from Website</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                We'll analyze the website and create sections automatically (header, footer, buttons, cards, etc.)
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowUrlModal(false);
                  setWebsiteUrl('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={isAnalyzing}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!websiteUrl.trim()) {
                    alert('Please enter a website URL');
                    return;
                  }
                  try {
                    setIsAnalyzing(true);
                    const response = await themeAPI.createFromUrl({ url: websiteUrl });
                    setShowUrlModal(false);
                    setWebsiteUrl('');
                    router.push(`/d/theme/section-list/${response.data.theme._id}`);
                  } catch (error: any) {
                    alert(error.response?.data?.message || 'Failed to analyze website');
                  } finally {
                    setIsAnalyzing(false);
                  }
                }}
                disabled={isAnalyzing || !websiteUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Create Theme'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Theme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Theme</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme Name
              </label>
              <input
                type="text"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="e.g., My Custom Theme"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewThemeName('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newThemeName.trim()) {
                    alert('Please enter a theme name');
                    return;
                  }
                  try {
                    const newTheme = await createTheme.mutateAsync({
                      name: newThemeName,
                      description: '',
                      globalStyles: {
                        primaryColor: '#007bff',
                        secondaryColor: '#6c757d',
                        fontFamily: 'Arial, sans-serif',
                        baseFontSize: '16px',
                        backgroundColor: '#ffffff',
                        textColor: '#212529',
                      },
                      sections: [],
                    });
                    setShowCreateModal(false);
                    setNewThemeName('');
                    router.push(`/d/theme/section-list/${newTheme._id}`);
                  } catch (error) {
                    alert('Failed to create theme');
                  }
                }}
                disabled={createTheme.isPending || !newThemeName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createTheme.isPending ? 'Creating...' : 'Create Theme'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
