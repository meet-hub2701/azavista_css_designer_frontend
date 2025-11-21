'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { themeAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { ArrowRight } from 'lucide-react';

export default function SectionListSelectPage() {
  const router = useRouter();
  const { data: themes, isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: () => themeAPI.getAll().then(res => res.data),
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Section List</h1>
            <p className="text-gray-600">Select a theme to view its sections</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading themes...</p>
            </div>
          ) : !themes || themes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No themes yet</h3>
              <p className="text-gray-600 mb-6">Create a theme first to view sections</p>
              <button
                onClick={() => router.push('/d/theme/list')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Theme List
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {themes.map((theme: any) => (
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
