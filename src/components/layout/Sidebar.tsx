'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { FileText, List, Layout, Code } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const themeId = params?.themeId as string;

  const menuItems = [
    {
      label: 'Theme List',
      path: '/d/theme/list',
      icon: List,
      disabled: false,
      requiresTheme: false,
    },
    {
      label: 'Section List',
      path: themeId ? `/d/theme/section-list/${themeId}` : '/d/theme/section-list',
      icon: Layout,
      disabled: false,
      requiresTheme: false,
    },
    {
      label: 'Headers and Footers',
      path: '/d/theme/headers-footers',
      icon: FileText,
      disabled: false,
      requiresTheme: false,
    },
    {
      label: 'CSS Builder',
      path: themeId ? `/d/theme/css-builder/${themeId}` : '/d/theme/css-builder',
      icon: Code,
      disabled: false,
      requiresTheme: false,
    },
  ];

  return (
    <div className="w-64 bg-[#1a2332] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-[#1a2332] font-bold text-sm">A</span>
          </div>
          <div>
            <div className="font-semibold text-sm">AZAVISTA</div>
            <div className="text-xs text-gray-400">EVENT TECHNOLOGY</div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="p-4">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-3">
          Theme
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.path);
            
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.requiresTheme && !themeId) {
                    // Redirect to theme list if theme is required but not selected
                    router.push('/d/theme/list');
                  } else {
                    router.push(item.path);
                  }
                }}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : item.disabled
                    ? 'text-gray-500 cursor-not-allowed opacity-50'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.requiresTheme && !themeId && (
                  <span className="ml-auto text-xs text-gray-500">*</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>


    </div>
  );
}
