'use client';

import { useRouter } from 'next/navigation';
import { Palette, FileCode, Sparkles } from 'lucide-react';
import { templates } from '@/templates';

export default function TemplatesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Palette className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">StyleForge</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600"
            >
              My Themes
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose a Template
          </h2>
          <p className="text-xl text-gray-600">
            Select a template and customize it with your brand colors and content
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
              onClick={() => router.push(`/editor?template=${template.id}`)}
            >
              <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <FileCode className="w-20 h-20 text-purple-600" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  Use This Template
                </button>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-purple-600 transition cursor-pointer">
            <div className="h-48 bg-gray-50 flex items-center justify-center">
              <Sparkles className="w-20 h-20 text-gray-400" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Blank Template
              </h3>
              <p className="text-gray-600 mb-4">Start from scratch with a blank canvas</p>
              <button
                onClick={() => router.push('/editor')}
                className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Start Blank
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
