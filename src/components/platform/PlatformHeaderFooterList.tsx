import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Plus, Home, MoreHorizontal, Monitor, Smartphone, Layout, Trash2, Edit, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

type HeaderFooterType = 'header' | 'footer';
type DeviceType = 'web' | 'desktop' | 'mobile';

interface HeaderFooterItem {
  id: string;
  name: string;
  type: HeaderFooterType;
  subType: string;
  isPublished: boolean;
  lastEdited: string;
  deviceType: DeviceType;
}

// Initial dummy data to match the screenshot roughly
const initialItems: HeaderFooterItem[] = [
  { id: '1', name: 'RiverBend-web-0.9', type: 'header', subType: 'Header', isPublished: false, lastEdited: 'Nov 15, 2023', deviceType: 'mobile' },
  { id: '2', name: 'GoldenField-web-0.8', type: 'footer', subType: 'Footer', isPublished: false, lastEdited: 'Jul 18, 2024', deviceType: 'web' },
  { id: '3', name: 'WildMeadow-web-1.9', type: 'header', subType: 'Header', isPublished: false, lastEdited: 'May 7, 2024', deviceType: 'desktop' },
  { id: '4', name: 'DeepCove-web-1.0', type: 'footer', subType: 'Footer', isPublished: false, lastEdited: 'Sep 17, 2023', deviceType: 'mobile' },
  { id: '5', name: 'WindWhisper-web-2.9', type: 'header', subType: 'Header', isPublished: false, lastEdited: 'Jan 29, 2024', deviceType: 'web' },
];

export default function PlatformHeaderFooterList() {
  const router = useRouter();
  const [items, setItems] = useState<HeaderFooterItem[]>(initialItems);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<HeaderFooterType>('header');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Search, Filter, Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<HeaderFooterType | 'all'>('all');
  const [filterDevice, setFilterDevice] = useState<DeviceType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const processedItems = useMemo(() => {
    let result = [...items];

    // 1. Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Filter by Type
    if (filterType !== 'all') {
      result = result.filter(item => item.type === filterType);
    }

    // 3. Filter by Device
    if (filterDevice !== 'all') {
      result = result.filter(item => item.deviceType === filterDevice);
    }

    return result;
  }, [items, searchTerm, filterType, filterDevice]);

  // Pagination Logic
  const totalPages = Math.ceil(processedItems.length / itemsPerPage);
  const paginatedItems = processedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCreate = () => {
    if (!newItemName.trim()) return;
    
    const newItem: HeaderFooterItem = {
      id: Date.now().toString(),
      name: newItemName,
      type: newItemType,
      subType: newItemType === 'header' ? 'Header' : 'Footer',
      isPublished: false,
      lastEdited: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      deviceType: 'web', // Default
    };
    
    setItems([newItem, ...items]);
    setShowCreateModal(false);
    setNewItemName('');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this item?')) {
      setItems(items.filter(item => item.id !== id));
      setActiveMenuId(null);
    }
  };

  const togglePublish = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isPublished: !item.isPublished } : item
    ));
  };

  const getDeviceBadge = (type: string) => {
    if (type === 'web') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-600">
          <Layout className="w-3.5 h-3.5" />
          Web
        </div>
      );
    } else if (type === 'desktop') {
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
          <span className="text-slate-500">Headers And Footers</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Header and Footer</h1>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              Create New
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Search</span>
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
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</span>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value as HeaderFooterType | 'all');
                    setCurrentPage(1);
                  }}
                  className="appearance-none flex items-center gap-2 px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm min-w-[140px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Types</option>
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Device</span>
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
                    Is Publish
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No items found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        Stylus
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        {getDeviceBadge(item.deviceType)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {item.lastEdited}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={item.isPublished}
                          onChange={() => togglePublish(item.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                        />
                      </td>
                      <td className="px-6 py-4 text-sm relative">
                        <button 
                          className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === item.id ? null : item.id);
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {/* Dropdown Menu */}
                        {activeMenuId === item.id && (
                          <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1 animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  // Navigate to editor (placeholder)
                                  alert('Edit functionality would go here');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, item.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all scale-100">
            <h2 className="text-xl font-bold mb-1 text-slate-900">Create New {newItemType === 'header' ? 'Header' : 'Footer'}</h2>
            <p className="text-sm text-slate-500 mb-6">Choose a type and name for your new item.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="header"
                    checked={newItemType === 'header'}
                    onChange={(e) => setNewItemType(e.target.value as HeaderFooterType)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Header</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="footer"
                    checked={newItemType === 'footer'}
                    onChange={(e) => setNewItemType(e.target.value as HeaderFooterType)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Footer</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`e.g., My ${newItemType === 'header' ? 'Header' : 'Footer'}`}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewItemName('');
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newItemName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center gap-2"
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
