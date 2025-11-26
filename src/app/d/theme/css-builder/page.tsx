'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { themeAPI, sectionAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import PlatformSidebar from '@/components/platform/PlatformSidebar';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Theme } from '@/shared-types';
import { useThemeStore } from '@/store/themeStore';

export default function CSSBuilderSelectPage() {
  const router = useRouter();
  const { mode } = useThemeStore();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [redirectStatus, setRedirectStatus] = useState('Loading themes...');

  const { data: themes, isLoading: isLoadingThemes } = useQuery({
    queryKey: ['themes'],
    queryFn: () => themeAPI.getAll().then(res => res.data),
  });

  useEffect(() => {
    const redirectToRecent = async () => {
      if (!themes || themes.length === 0) {
        setIsRedirecting(false);
        return;
      }

      try {
        setRedirectStatus('Finding recent work...');
        
        // Sort themes by updatedAt desc
        const sortedThemes = [...themes].sort((a, b) => {
          const dateA = new Date(a.updatedAt || 0).getTime();
          const dateB = new Date(b.updatedAt || 0).getTime();
          return dateB - dateA;
        });

        const mostRecentTheme = sortedThemes[0];
        
        if (mostRecentTheme) {
          setRedirectStatus(`Loading sections for ${mostRecentTheme.name}...`);
          // Fetch sections for the most recent theme
          const sectionsRes = await sectionAPI.getByTheme(mostRecentTheme._id!);
          const sections = sectionsRes.data;

          if (sections && sections.length > 0) {
            // Sort sections by order or updatedAt if available (assuming order for now as default view)
            // Ideally we'd track lastEditedSectionId in the theme or user preferences
            const targetSection = sections[0]; 
            
            router.replace(`/d/theme/css-builder/${mostRecentTheme._id}/${targetSection._id}`);
            return;
          }
        }
        
        // Fallback if no sections or something fails
        setIsRedirecting(false);
      } catch (error) {
        console.error("Failed to auto-redirect:", error);
        setIsRedirecting(false);
      }
    };

    if (!isLoadingThemes) {
      redirectToRecent();
    }
  }, [themes, isLoadingThemes, router]);

  if (isRedirecting || isLoadingThemes) {
    if (mode === 'platform') {
      return (
        <div className="flex h-screen bg-white font-sans">
          <PlatformSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">{redirectStatus}</h3>
              <p className="text-slate-500 mt-2">Taking you to your last edit...</p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">{redirectStatus}</h3>
            <p className="text-gray-500 mt-2">Taking you to your last edit...</p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'platform') {
    return (
      <div className="flex h-screen bg-white font-sans">
        <PlatformSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">CSS Builder</h1>
              <p className="text-slate-600">Select a theme to edit its sections</p>
            </div>

            {!themes || themes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No themes yet</h3>
                <p className="text-slate-600 mb-6">Create a theme first to use the CSS Builder</p>
                <button
                  onClick={() => router.push('/d/theme/list')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Theme List
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {themes.map((theme: Theme) => (
                  <div
                    key={theme._id}
                    onClick={() => router.push(`/d/theme/section-list/${theme._id}`)}
                    className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition p-6 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition">
                          {theme.name}
                        </h3>
                        {theme.description && (
                          <p className="text-sm text-slate-600 mt-1">{theme.description}</p>
                        )}
                        {theme.sourceUrl && (
                          <p className="text-xs text-slate-500 mt-2">From: {theme.sourceUrl}</p>
                        )}
                      </div>
                      <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CSS Builder</h1>
            <p className="text-gray-600">Select a theme to edit its sections</p>
          </div>

          {!themes || themes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No themes yet</h3>
              <p className="text-gray-600 mb-6">Create a theme first to use the CSS Builder</p>
              <button
                onClick={() => router.push('/d/theme/list')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Theme List
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {themes.map((theme: Theme) => (
                <div
                  key={theme._id}
                  onClick={() => router.push(`/d/theme/section-list/${theme._id}`)}
                  className="bg-white rounded-lg shadow hover:shadow-md transition p-6 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {theme.name}
                      </h3>
                      {theme.description && (
                        <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                      )}
                      {theme.sourceUrl && (
                        <p className="text-xs text-gray-500 mt-2">From: {theme.sourceUrl}</p>
                      )}
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
