import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Plus, Home, MoreHorizontal, Monitor, Smartphone, Layout, Trash2, Copy, Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { Theme } from '@/shared-types';
import { useDeleteTheme, useDuplicateTheme, useCreateTheme } from '@/hooks/useThemes';
import { themeAPI } from '@/lib/api';

interface PlatformThemeListProps {
  themes: Theme[] | undefined;
}

type SortField = 'name' | 'updatedAt';
type SortOrder = 'asc' | 'desc';
type DeviceType = 'web' | 'desktop' | 'mobile';

export default function PlatformThemeList({ themes }: PlatformThemeListProps) {
  const router = useRouter();
  const { toggleMode } = useThemeStore();
  const deleteTheme = useDeleteTheme();
  const duplicateTheme = useDuplicateTheme();
  const createTheme = useCreateTheme();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Search, Filter, Sort, Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DeviceType | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Helper to deterministically assign a device type based on ID (for demo purposes)
  const getDeviceType = (id: string): DeviceType => {
    const lastChar = id.slice(-1);
    const code = lastChar.charCodeAt(0);
    if (code % 3 === 0) return 'web';
    if (code % 3 === 1) return 'desktop';
    return 'mobile';
  };

  const processedThemes = useMemo(() => {
    if (!themes) return [];

    let result = [...themes];

    // 1. Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(theme => 
        theme.name.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Filter
    if (filterType !== 'all') {
      result = result.filter(theme => theme._id && getDeviceType(theme._id) === filterType);
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortField === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

    return result;
  }, [themes, searchTerm, filterType, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(processedThemes.length / itemsPerPage);
  const paginatedThemes = processedThemes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this theme?')) return;
    try {
      await deleteTheme.mutateAsync(id);
      setActiveMenuId(null);
    } catch (error) {
      alert('Failed to delete theme');
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await duplicateTheme.mutateAsync(id);
      setActiveMenuId(null);
    } catch (error) {
      alert('Failed to duplicate theme');
    }
  };

  const handleDownload = (e: React.MouseEvent, theme: Theme) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(theme, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${theme.name.replace(/\s+/g, '_')}_theme.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setActiveMenuId(null);
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">List</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Theme List</h1>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMode}
              className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-r-transparent rotate-45 group-hover:border-slate-700 transition-colors"></div>
              Theme Switcher
            </button>
            <button 
              onClick={() => setShowUrlModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              From URL
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              Theme
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Search for Themes</span>
              </div>
            </div>
            <div className="mt-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-end gap-6 pb-0.5">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</span>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value as DeviceType | 'all');
                    setCurrentPage(1);
                  }}
                  className="appearance-none flex items-center gap-2 px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm min-w-[120px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Types</option>
                  <option value="web">Web</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort By</span>
              <button 
                onClick={() => handleSort('name')}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-all shadow-sm min-w-[100px] justify-between ${
                  sortField === 'name' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Name
                {sortField === 'name' && (
                  <ArrowUpDown className={`w-3.5 h-3.5 ${sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'} transition-transform`} />
                )}
              </button>
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
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 group"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      <ArrowUpDown className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${sortField === 'name' ? 'opacity-100 text-blue-600' : ''}`} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 group"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center gap-1">
                      Last Edited
                      <ArrowUpDown className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${sortField === 'updatedAt' ? 'opacity-100 text-blue-600' : ''}`} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedThemes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No themes found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedThemes.map((theme) => {
                    if (!theme._id) return null;
                    const deviceType = getDeviceType(theme._id);
                    return (
                      <tr 
                        key={theme._id} 
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => router.push(`/d/theme/section-list/${theme._id}`)}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          Stylus
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                          {theme.name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {deviceType === 'web' ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-600">
                                <Layout className="w-3.5 h-3.5" />
                                Web
                              </div>
                            ) : deviceType === 'desktop' ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-md text-xs font-medium text-rose-600">
                                <Monitor className="w-3.5 h-3.5" />
                                Desktop
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-md text-xs font-medium text-emerald-600">
                                <Smartphone className="w-3.5 h-3.5" />
                                Mobile
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(theme.updatedAt)}
                        </td>
                        <td className="px-6 py-4 text-sm relative">
                          <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => handleDownload(e, theme)}
                              className="text-blue-600 hover:text-blue-700 font-medium text-xs uppercase tracking-wide flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                            <button 
                              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === theme._id ? null : theme._id!);
                              }}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Dropdown Menu */}
                          {activeMenuId === theme._id && (
                            <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={(e) => handleDuplicate(e, theme._id!)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Copy className="w-4 h-4" />
                                Duplicate
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, theme._id!)}
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

      {/* Create From URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all scale-100">
            <h2 className="text-xl font-bold mb-1 text-slate-900">Create Theme from Website</h2>
            <p className="text-sm text-slate-500 mb-6">Enter a URL to analyze and create sections automatically.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowUrlModal(false);
                  setWebsiteUrl('');
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  'Create Theme'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Theme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all scale-100">
            <h2 className="text-xl font-bold mb-1 text-slate-900">Create New Theme</h2>
            <p className="text-sm text-slate-500 mb-6">Give your new theme a name to get started.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Theme Name
              </label>
              <input
                type="text"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="e.g., Enterprise Dashboard"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewThemeName('');
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                {createTheme.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  'Create Theme'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
