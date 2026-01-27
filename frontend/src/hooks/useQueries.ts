/**
 * React Query Hooks
 * Nepal Election Portal Frontend
 * 
 * Custom hooks for data fetching using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  voterEducationApi,
  electionIntegrityApi,
  newslettersApi,
  partiesApi,
  statsApi,
  VoterEducation,
  ElectionIntegrity,
  Newsletter,
  PoliticalParty,
} from '@/lib/api';
import { toast } from 'sonner';

// Query Keys
export const queryKeys = {
  stats: {
    public: ['stats', 'public'] as const,
  },
  voterEducation: {
    all: ['voter-education'] as const,
    list: (page: number, language?: string) => [...queryKeys.voterEducation.all, 'list', page, language] as const,
    detail: (id: number) => [...queryKeys.voterEducation.all, 'detail', id] as const,
    admin: (page: number, filters?: object) => [...queryKeys.voterEducation.all, 'admin', page, filters] as const,
  },
  electionIntegrity: {
    all: ['election-integrity'] as const,
    list: (page: number, filters?: object) => [...queryKeys.electionIntegrity.all, 'list', page, filters] as const,
    detail: (id: number) => [...queryKeys.electionIntegrity.all, 'detail', id] as const,
    categories: () => [...queryKeys.electionIntegrity.all, 'categories'] as const,
    admin: (page: number, filters?: object) => [...queryKeys.electionIntegrity.all, 'admin', page, filters] as const,
  },
  newsletters: {
    all: ['newsletters'] as const,
    list: (page: number, filters?: object) => [...queryKeys.newsletters.all, 'list', page, filters] as const,
    detail: (id: number) => [...queryKeys.newsletters.all, 'detail', id] as const,
    admin: (page: number, filters?: object) => [...queryKeys.newsletters.all, 'admin', page, filters] as const,
  },
  parties: {
    all: ['parties'] as const,
    list: (page: number) => [...queryKeys.parties.all, 'list', page] as const,
    detail: (id: number) => [...queryKeys.parties.all, 'detail', id] as const,
    admin: (page: number, filters?: object) => [...queryKeys.parties.all, 'admin', page, filters] as const,
  },
};

// ============ STATS HOOKS ============

export const usePublicStats = () => {
  return useQuery({
    queryKey: queryKeys.stats.public,
    queryFn: () => statsApi.getPublic(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['stats', 'admin'],
    queryFn: () => statsApi.getAdmin(),
    staleTime: 1000 * 60, // Cache for 1 minute
  });
};

// ============ VOTER EDUCATION HOOKS ============

export const useVoterEducation = (page = 1, language?: string) => {
  return useQuery({
    queryKey: queryKeys.voterEducation.list(page, language),
    queryFn: () => voterEducationApi.getAll(page, 10, language),
  });
};

export const useVoterEducationDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.voterEducation.detail(id),
    queryFn: () => voterEducationApi.getById(id),
    enabled: !!id,
  });
};

export const useAdminVoterEducation = (page = 1, filters?: { language?: string; published?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.voterEducation.admin(page, filters),
    queryFn: () => voterEducationApi.adminGetAll(page, 10, filters),
  });
};

export const useCreateVoterEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<VoterEducation>) => voterEducationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.voterEducation.all });
      toast.success('Voter education resource created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create resource');
    },
  });
};

export const useUpdateVoterEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VoterEducation> }) => 
      voterEducationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.voterEducation.all });
      toast.success('Voter education resource updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update resource');
    },
  });
};

export const useDeleteVoterEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => voterEducationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.voterEducation.all });
      toast.success('Voter education resource deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete resource');
    },
  });
};

export const useToggleVoterEducationPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => voterEducationApi.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.voterEducation.all });
      toast.success('Publish status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle publish status');
    },
  });
};

// ============ ELECTION INTEGRITY HOOKS ============

export const useElectionIntegrity = (page = 1, filters?: { category?: string; language?: string }) => {
  return useQuery({
    queryKey: queryKeys.electionIntegrity.list(page, filters),
    queryFn: () => electionIntegrityApi.getAll(page, 10, filters),
  });
};

export const useElectionIntegrityDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.electionIntegrity.detail(id),
    queryFn: () => electionIntegrityApi.getById(id),
    enabled: !!id,
  });
};

export const useElectionIntegrityCategories = () => {
  return useQuery({
    queryKey: queryKeys.electionIntegrity.categories(),
    queryFn: () => electionIntegrityApi.getCategories(),
    staleTime: Infinity,
  });
};

export const useAdminElectionIntegrity = (page = 1, filters?: { category?: string; language?: string; published?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.electionIntegrity.admin(page, filters),
    queryFn: () => electionIntegrityApi.adminGetAll(page, 10, filters),
  });
};

export const useCreateElectionIntegrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ElectionIntegrity>) => electionIntegrityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.electionIntegrity.all });
      toast.success('Election integrity resource created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create resource');
    },
  });
};

export const useUpdateElectionIntegrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ElectionIntegrity> }) => 
      electionIntegrityApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.electionIntegrity.all });
      toast.success('Election integrity resource updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update resource');
    },
  });
};

export const useDeleteElectionIntegrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => electionIntegrityApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.electionIntegrity.all });
      toast.success('Election integrity resource deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete resource');
    },
  });
};

export const useToggleElectionIntegrityPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => electionIntegrityApi.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.electionIntegrity.all });
      toast.success('Publish status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle publish status');
    },
  });
};

// ============ NEWSLETTERS HOOKS ============

export const useNewsletters = (page = 1, filters?: { source?: string; language?: string }) => {
  return useQuery({
    queryKey: queryKeys.newsletters.list(page, filters),
    queryFn: () => newslettersApi.getAll(page, 10, filters),
  });
};

export const useNewsletterDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.newsletters.detail(id),
    queryFn: () => newslettersApi.getById(id),
    enabled: !!id,
  });
};

export const useAdminNewsletters = (page = 1, filters?: { source?: string; language?: string; published?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.newsletters.admin(page, filters),
    queryFn: () => newslettersApi.adminGetAll(page, 10, filters),
  });
};

export const useCreateNewsletter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Newsletter>) => newslettersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletters.all });
      toast.success('Newsletter created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create newsletter');
    },
  });
};

export const useUpdateNewsletter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Newsletter> }) => 
      newslettersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletters.all });
      toast.success('Newsletter updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update newsletter');
    },
  });
};

export const useDeleteNewsletter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => newslettersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletters.all });
      toast.success('Newsletter deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete newsletter');
    },
  });
};

export const useToggleNewsletterPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => newslettersApi.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletters.all });
      toast.success('Publish status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle publish status');
    },
  });
};

// ============ POLITICAL PARTIES HOOKS ============

export const usePoliticalParties = (page = 1) => {
  return useQuery({
    queryKey: queryKeys.parties.list(page),
    queryFn: () => partiesApi.getAll(page, 50),
  });
};

export const usePoliticalPartyDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.parties.detail(id),
    queryFn: () => partiesApi.getById(id),
    enabled: !!id,
  });
};

export const useAdminPoliticalParties = (page = 1, filters?: { published?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.parties.admin(page, filters),
    queryFn: () => partiesApi.adminGetAll(page, 50, filters),
  });
};

export const useCreatePoliticalParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PoliticalParty>) => partiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parties.all });
      toast.success('Political party created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create party');
    },
  });
};

export const useUpdatePoliticalParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PoliticalParty> }) => 
      partiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parties.all });
      toast.success('Political party updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update party');
    },
  });
};

export const useDeletePoliticalParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => partiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parties.all });
      toast.success('Political party deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete party');
    },
  });
};

export const useTogglePoliticalPartyPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => partiesApi.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parties.all });
      toast.success('Publish status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle publish status');
    },
  });
};
