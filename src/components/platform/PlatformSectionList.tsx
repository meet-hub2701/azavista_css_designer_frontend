import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Plus, Home, MoreHorizontal, Monitor, Smartphone, Layout, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Section } from '@/shared-types';
import { useCreateSection, useDeleteSection } from '@/hooks/useSections';
import { SectionType } from '@/shared-types';

interface PlatformSectionListProps {
  sections: Section[] | undefined;
  themeId: string;
  themeName: string | undefined;
}

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

type DeviceType = 'web' | 'desktop' | 'mobile';

export default function PlatformSectionList({ sections, themeId, themeName }: PlatformSectionListProps) {
  const router = useRouter();
  const createSection = useCreateSection();
  const deleteSection = useDeleteSection();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [selectedType, setSelectedType] = useState<SectionType>('card');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Search, Filter, Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<SectionType | 'all'>('all');
  const [filterDevice, setFilterDevice] = useState<DeviceType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Helper to get device type based on section type
  const getDeviceType = (type: string): DeviceType => {
    if (['header', 'footer', 'navigation'].includes(type)) return 'web';
    if (['hero', 'content', 'form'].includes(type)) return 'desktop';
    return 'mobile';
  };

  const processedSections = useMemo(() => {
    if (!sections) return [];

    let result = [...sections];

    // 1. Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(section => 
        section.name.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Filter by Section Type
    if (filterType !== 'all') {
      result = result.filter(section => section.type === filterType);
    }

    // 3. Filter by Device Type
    if (filterDevice !== 'all') {
      result = result.filter(section => getDeviceType(section.type) === filterDevice);
    }

    return result;
  }, [sections, searchTerm, filterType, filterDevice]);

  // Pagination Logic
  const totalPages = Math.ceil(processedSections.length / itemsPerPage);
  const paginatedSections = processedSections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this section?')) return;
    try {
      await deleteSection.mutateAsync({ id, themeId });
      setActiveMenuId(null);
    } catch (error) {
      alert('Failed to delete section');
    }
  };

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
      
      setShowCreateModal(false);
      setSectionName('');
      router.push(`/d/theme/css-builder/${themeId}/${newSection._id}`);
    } catch (error) {
      alert('Failed to create section');
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper to get badge style based on type
  const getTypeBadge = (type: string) => {
    const deviceType = getDeviceType(type);
    if (deviceType === 'web') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-600">
          <Layout className="w-3.5 h-3.5" />
          Web
        </div>
      );
    } else if (deviceType === 'desktop') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-md text-xs font-medium text-rose-600">
          <Monitor className="w-3.5 h-3.5" />
          Desktop
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-md text-xs font-medium text-emerald-600">
          <Smartphone className="w-3.5 h-3.5" />
          Mobile
        </div>
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-screen overflow-hidden font-sans" onClick={() => setActiveMenuId(null)}>
      {/* Header */}
      <div className="px-8 pt-8 pb-6 bg-white border-b border-gray-200">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
          <Home className="w-3.5 h-3.5" />
          <span className="text-slate-300">/</span>
          <span>Theme</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Section List</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Section List</h1>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Search for Sections</span>
              </div>
            </div>
            <div className="mt-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-end gap-6 pb-0.5">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Style Type</span>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value as SectionType | 'all');
                    setCurrentPage(1);
                  }}
                  className="appearance-none flex items-center gap-2 px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm min-w-[140px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Styles</option>
                  {sectionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</span>
              <div className="relative">
                <select
                  value={filterDevice}
                  onChange={(e) => {
                    setFilterDevice(e.target.value as DeviceType | 'all');
                    setCurrentPage(1);
                  }}
                  className="appearance-none flex items-center gap-2 px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm min-w-[100px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All</option>
                  <option value="web">Web</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full max-h-[calc(100vh-300px)]">
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="w-12 px-6 py-4">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:text-blue-700">
                    Style Type
                    <Filter className="w-3 h-3" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Last Edited
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedSections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No sections found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedSections.map((section) => {
                    if (!section._id) return null;
                    return (
                      <tr 
                        key={section._id} 
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => router.push(`/d/theme/css-builder/${themeId}/${section._id}`)}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          Stylus
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                          {section.name}
                        </td>
                        <td className="px-6 py-4">
                          {getTypeBadge(section.type)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(new Date().toISOString())} {/* Using current date as sections don't have updatedAt yet */}
                        </td>
                        <td className="px-6 py-4 text-sm relative">
                          <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === section._id ? null : section._id!);
                              }}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Dropdown Menu */}
                          {activeMenuId === section._id && (
                            <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/d/theme/css-builder/${themeId}/${section._id}`);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit CSS
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, section._id!)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Section Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl transform transition-all scale-100">
            <h2 className="text-xl font-bold mb-1 text-slate-900">Add New Section</h2>
            <p className="text-sm text-slate-500 mb-6">Choose a type and name for your new section.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Section Name
              </label>
              <input
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g., Main Header"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                autoFocus
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Section Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {sectionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      selectedType === type.value
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{type.icon}</div>
                    <div className="text-xs font-medium text-slate-700">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSectionName('');
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSection}
                disabled={createSection.isPending || !sectionName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                {createSection.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  'Create Section'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
