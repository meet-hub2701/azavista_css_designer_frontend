import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionAPI } from '@/lib/api';
import type { Section } from '../shared-types';

export function useSections(themeId: string) {
  return useQuery({
    queryKey: ['sections', themeId],
    queryFn: async () => {
      const response = await sectionAPI.getByTheme(themeId);
      return response.data as Section[];
    },
    enabled: !!themeId,
  });
}

export function useSection(id: string) {
  return useQuery({
    queryKey: ['section', id],
    queryFn: async () => {
      const response = await sectionAPI.getById(id);
      return response.data as Section;
    },
    enabled: !!id,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ themeId, data }: { themeId: string; data: Partial<Section> }) => {
      const response = await sectionAPI.create(themeId, data);
      return response.data;
    },
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['sections', variables.themeId] });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Section> }) => {
      const response = await sectionAPI.update(id, data);
      return response.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['sections', data.themeId] });
      queryClient.invalidateQueries({ queryKey: ['section', data._id] });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, themeId }: { id: string; themeId: string }) => {
      await sectionAPI.delete(id);
      return themeId;
    },
    onSuccess: (themeId: any) => {
      queryClient.invalidateQueries({ queryKey: ['sections', themeId] });
    },
  });
}

export function useUpdateSectionOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, newOrder, themeId }: { id: string; newOrder: number; themeId: string }) => {
      const response = await sectionAPI.updateOrder(id, newOrder);
      return { data: response.data, themeId };
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['sections', result.themeId] });
    },
  });
}
