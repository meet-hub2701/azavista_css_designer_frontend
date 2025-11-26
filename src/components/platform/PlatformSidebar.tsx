'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Home, Palette, MessageSquare, HelpCircle, Settings, Search, ChevronUp } from 'lucide-react';

export default function PlatformSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const themeId = params.themeId as string;
  const sectionId = params.sectionId as string;

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col font-sans shrink-0">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-transparent">
        <div className="text-blue-600">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4L4 28H12L16 20L20 28H28L16 4Z" fill="currentColor" />
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">AZAVISTA</span>
          <span className="text-[10px] text-slate-400 tracking-[0.2em] uppercase font-medium mt-0.5">Event Technology</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <Link href="/d/theme/list" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors group">
          <Home className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 text-blue-900 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs shadow-sm">
                <div className="w-2 h-2 bg-white rounded-full overflow-hidden relative">
                   <div className="absolute inset-0 bg-white opacity-50"></div>
                </div>
              </div>
              <span className="text-sm font-semibold">Theme</span>
            </div>
            <ChevronUp className="w-4 h-4 text-slate-400" />
          </div>
          
          <div className="relative pl-4 pr-2 space-y-0.5 my-1">
            {/* Vertical line for hierarchy */}
            <div className="absolute left-[21px] top-0 bottom-0 w-px bg-slate-200"></div>
            
            <Link 
              href="/d/theme/list" 
              className={`relative flex items-center justify-between py-2 pl-8 pr-3 text-sm rounded-md transition-colors ${
                pathname === '/d/theme/list' 
                  ? 'text-blue-600 bg-blue-50/50 font-medium' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {pathname === '/d/theme/list' && (
                <div className="absolute left-[19px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-blue-600 ring-4 ring-white"></div>
              )}
              Theme List
            </Link>

            <Link 
              href={themeId ? `/d/theme/section-list/${themeId}` : '/d/theme/section-list'}
              className={`relative block py-2 pl-8 pr-3 text-sm rounded-md transition-colors ${
                pathname.includes('/section-list') 
                  ? 'text-blue-600 bg-blue-50/50 font-medium' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {pathname.includes('/section-list') && (
                <div className="absolute left-[19px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-blue-600 ring-4 ring-white"></div>
              )}
              Section List
            </Link>

            <Link 
              href="/d/theme/headers-footers"
              className={`relative block py-2 pl-8 pr-3 text-sm rounded-md transition-colors ${
                pathname.includes('/headers-footers') 
                  ? 'text-blue-600 bg-blue-50/50 font-medium' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {pathname.includes('/headers-footers') && (
                <div className="absolute left-[19px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-blue-600 ring-4 ring-white"></div>
              )}
              Header and Footer
            </Link>

            <Link 
              href={themeId && sectionId ? `/d/theme/css-builder/${themeId}/${sectionId}` : '/d/theme/css-builder'}
              className={`relative block py-2 pl-8 pr-3 text-sm rounded-md transition-colors ${
                pathname.includes('/css-builder') 
                  ? 'text-blue-600 bg-blue-50/50 font-medium' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {pathname.includes('/css-builder') && (
                <div className="absolute left-[19px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-blue-600 ring-4 ring-white"></div>
              )}
              CSS builder
            </Link>
          </div>
        </div>

        <a href="#" className="flex items-center justify-between px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors group mt-2">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="text-sm font-medium">Messages</span>
          </div>
          <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">!</span>
        </a>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 space-y-1 border-t border-gray-100">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors group">
          <HelpCircle className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          <span className="text-sm font-medium">Support</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors group">
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          <span className="text-sm font-medium">Settings</span>
        </a>
      </div>
    </div>
  );
}
