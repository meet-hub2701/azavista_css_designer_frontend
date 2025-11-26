'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useTheme } from '@/hooks/useThemes';
import { useSections, useCreateSection, useDeleteSection } from '@/hooks/useSections';
import type { SectionType } from '@/shared-types';
import { useThemeStore } from '@/store/themeStore';
import PlatformSidebar from '@/components/platform/PlatformSidebar';
import PlatformSectionList from '@/components/platform/PlatformSectionList';

const sectionTypes: { value: SectionType; label: string; icon: string }[] = [
  { value: 'header', label: 'Header', icon: '📋' },
  { value: 'footer', label: 'Footer', icon: '📄' },
  { value: 'navigation', label: 'Navigation', icon: '🧭' },
  { value: 'hero', label: 'Hero Section', icon: '🎯' },
  { value: 'card', label: 'Card', icon: '🃏' },
  { value: 'button', label: 'Button', icon: '🔘' },
  { value: 'form', label: 'Form', icon: '📝' },
  { value: 'content', label: 'Content', icon: '📰' },
  { value: 'custom', label: 'Custom', icon: '⚙️' },
];

export default function SectionListPage() {
  const router = useRouter();
  const params = useParams();
  const themeId = params.themeId as string;
  const { mode } = useThemeStore();
  
  const { data: themeData, isLoading: themeLoading } = useTheme(themeId);
  const theme = themeData?.theme;
  const { data: sections, isLoading: sectionsLoading } = useSections(themeId);
  const createSection = useCreateSection();
  const deleteSection = useDeleteSection();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<SectionType>('card');
  const [sectionName, setSectionName] = useState('');

  const handleAddSection = async () => {
    if (!sectionName.trim()) {
      alert('Please enter a section name');
      return;
    }

    try {
      const newSection = await createSection.mutateAsync({
        themeId,
        data: {
          name: sectionName,
          type: selectedType,
          cssProperties: {
            colors: {
              background: '#ffffff',
              text: '#212529',
              border: '#dee2e6',
              hover: '#007bff',
            },
            typography: {
              fontSize: '16px',
              fontWeight: '400',
              lineHeight: '1.5',
              letterSpacing: '0',
            },
            spacing: {
              padding: '1rem',
              margin: '0',
              gap: '1rem',
            },
            borders: {
              radius: '0.375rem',
              width: '1px',
              style: 'solid',
            },
            effects: {
              shadow: 'none',
              transition: 'all 0.3s ease',
            },
          },
          isActive: true,
          order: sections?.length || 0,
        },
      });
      
      setShowAddModal(false);
      setSectionName('');
      router.push(`/d/theme/css-builder/${themeId}/${newSection._id}`);
    } catch (error) {
      alert('Failed to create section');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete section "${name}"?`)) return;
    try {
      await deleteSection.mutateAsync({ id, themeId });
    } catch (error) {
      alert('Failed to delete section');
    }
  };

  if (mode === 'platform') {
    return (
      <div className="flex h-screen bg-white font-sans">
        <PlatformSidebar />
        <PlatformSectionList 
          sections={sections} 
          themeId={themeId} 
          themeName={theme?.name} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/d/theme/list')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {themeLoading ? 'Loading...' : theme?.name}
              </h1>
              <p className="text-gray-600 mt-1">Manage sections for this theme</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Section
            </button>
          </div>

          {/* Global Styles Preview */}
          {theme && (
            <div className="flex gap-4 items-center text-sm">
              <span className="text-gray-600">Global Colors:</span>
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: theme.globalStyles.primaryColor }}
                  title="Primary"
                />
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: theme.globalStyles.secondaryColor }}
                  title="Secondary"
                />
              </div>
              <span className="text-gray-600 ml-4">Font: {theme.globalStyles.fontFamily}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sectionsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading sections...</p>
          </div>
        ) : !sections || sections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sections yet</h3>
            <p className="text-gray-600 mb-6">Add sections to build your theme</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add First Section
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section: any, index: number) => (
              <div
                key={section._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
              >
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="cursor-move text-gray-400">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Section Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {sectionTypes.find(t => t.value === section.type)?.icon || '⚙️'}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {section.name}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {section.type} • Order: {section.order}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: section.cssProperties.colors.background }}
                      title="Background"
                    />
                    <div
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: section.cssProperties.colors.text }}
                      title="Text"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/d/theme/css-builder/${themeId}/${section._id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                      Edit CSS
                    </button>
                    <button
                      onClick={() => handleDelete(section._id!, section.name)}
                      disabled={deleteSection.isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Add New Section</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Name
              </label>
              <input
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g., Main Header, Product Card"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {sectionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      selectedType === type.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSectionName('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSection}
                disabled={createSection.isPending || !sectionName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createSection.isPending ? 'Creating...' : 'Create Section'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
