import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { themeAPI } from '@/lib/api';
import type { Theme } from '../shared-types';

export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      const response = await themeAPI.getAll();
      return response.data as Theme[];
    },
  });
}

export function useTheme(id: string) {
  return useQuery({
    queryKey: ['theme', id],
    queryFn: async () => {
      const response = await themeAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateTheme() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Theme>) => {
      const response = await themeAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });
}

export function useUpdateTheme() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Theme> }) => {
      const response = await themeAPI.update(id, data);
      return response.data;
    },
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.invalidateQueries({ queryKey: ['theme', variables.id] });
    },
  });
}

export function useDeleteTheme() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await themeAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });
}

export function useDuplicateTheme() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await themeAPI.create({ _id: id }); // Will use duplicate endpoint
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });
}
