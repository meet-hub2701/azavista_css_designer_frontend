'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/hooks/useThemes';
import { useSections } from '@/hooks/useSections';
import { useThemeStore } from '@/store/themeStore';
import PlatformSidebar from '@/components/platform/PlatformSidebar';
import PlatformSectionList from '@/components/platform/PlatformSectionList';
import Sidebar from '@/components/layout/Sidebar';

export default function SectionListPage() {
  const router = useRouter();
  const params = useParams();
  const themeId = params.themeId as string;
  const { mode } = useThemeStore();
  
  const { data: themeData, isLoading: themeLoading } = useTheme(themeId);
  const theme = themeData?.theme;
  const { data: sections, isLoading: sectionsLoading } = useSections(themeId);

  if (mode === 'platform') {
    return (
      <div className="flex h-screen bg-white font-sans">
        <PlatformSidebar />
        <PlatformSectionList 
          sections={sections} 
          themeId={themeId} 
          themeName={theme?.name} 
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white font-sans">
      <Sidebar />
      <PlatformSectionList 
        sections={sections} 
        themeId={themeId} 
        themeName={theme?.name} 
      />
    </div>
  );
}
