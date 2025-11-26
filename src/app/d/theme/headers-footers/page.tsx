'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import PlatformSidebar from '@/components/platform/PlatformSidebar';
import PlatformHeaderFooterList from '@/components/platform/PlatformHeaderFooterList';

type HeaderFooterType = 'header' | 'footer';

interface HeaderFooterItem {
  id: string;
  name: string;
  type: HeaderFooterType;
  subType: string;
  isPublished: boolean;
}

export default function HeadersFootersPage() {
  const router = useRouter();
  const { mode } = useThemeStore();
  
  // For now, using local state. In production, this would fetch from database
  const [items, setItems] = useState<HeaderFooterItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<HeaderFooterType>('header');

  const handleCreate = () => {
    if (!newItemName.trim()) return;
    
    const newItem: HeaderFooterItem = {
      id: Date.now().toString(),
      name: newItemName,
      type: newItemType,
      subType: newItemType === 'header' ? 'Header' : 'Footer',
      isPublished: false,
    };
    
    setItems([...items, newItem]);
    setShowCreateModal(false);
    setNewItemName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this item?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const togglePublish = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isPublished: !item.isPublished } : item
    ));
  };

  if (mode === 'platform') {
    return (
      <div className="flex h-screen bg-white font-sans">
        <PlatformSidebar />
        <PlatformHeaderFooterList />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sub Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Is Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">{item.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.subType}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublish(item.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          item.isPublished
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {item.isPublished && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="border-t px-6 py-3 flex items-center justify-end bg-white">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  1-{items.length} of {items.length}
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
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New {newItemType === 'header' ? 'Header' : 'Footer'}</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="header"
                    checked={newItemType === 'header'}
                    onChange={(e) => setNewItemType(e.target.value as HeaderFooterType)}
                    className="mr-2"
                  />
                  Header
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="footer"
                    checked={newItemType === 'footer'}
                    onChange={(e) => setNewItemType(e.target.value as HeaderFooterType)}
                    className="mr-2"
                  />
                  Footer
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`e.g., My ${newItemType === 'header' ? 'Header' : 'Footer'}`}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewItemName('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newItemName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
