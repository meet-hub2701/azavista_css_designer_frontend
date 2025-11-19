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
    },
    {
      label: 'Section List',
      path: themeId ? `/d/theme/section-list/${themeId}` : '/d/theme/section-list',
      icon: Layout,
      disabled: !themeId,
    },
    {
      label: 'Headers and Footers',
      path: '/d/theme/headers-footers',
      icon: FileText,
      disabled: false,
    },
    {
      label: 'CSS Builder',
      path: '/d/theme/css-builder',
      icon: Code,
      disabled: true,
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
                key={item.path}
                onClick={() => !item.disabled && router.push(item.path)}
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
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
