'use client';

import { useEffect, useState } from 'react';
import { Plus, Palette, Trash2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { themeAPI } from '@/lib/api';
import { useThemeStore } from '@/store/useThemeStore';
import { Theme } from '@/shared-types';

export default function Dashboard() {
  const router = useRouter();
  const { themes, setThemes } = useThemeStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const response = await themeAPI.getAll();
      setThemes(response.data);
    } catch (error) {
      console.error('Failed to load themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this theme?')) return;
    try {
      await themeAPI.delete(id);
      loadThemes();
    } catch (error) {
      console.error('Failed to delete theme:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Palette className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">StyleForge</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Themes</h2>
          <button
            onClick={() => router.push('/editor')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            New Theme
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : themes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No themes yet</h3>
            <p className="text-gray-600 mb-6">Create your first theme to get started</p>
            <button
              onClick={() => router.push('/templates')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Browse Templates
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <div key={theme._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{theme.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/editor/${theme._id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(theme._id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: theme.globalStyles.primaryColor }}
                  />
                  <div
                    className="w-8 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: theme.globalStyles.secondaryColor }}
                  />
                  <div
                    className="w-8 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: theme.globalStyles.backgroundColor }}
                  />
                </div>
                {theme.description && (
                  <p className="text-sm text-gray-600 truncate">{theme.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
