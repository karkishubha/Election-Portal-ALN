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
  violationsApi,
  misinformationApi,
  infographicsApi,
  videosApi,
  explainersApi,
  announcementsApi,
  VoterEducation,
  ElectionIntegrity,
  Newsletter,
  PoliticalParty,
  Violation,
  Misinformation,
  Infographic,
  VideoResource,
  Explainer,
  Announcement,
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
  violations: {
    all: ['violations'] as const,
    list: (page: number, language?: string) => [...queryKeys.violations.all, 'list', page, language] as const,
    detail: (id: number) => [...queryKeys.violations.all, 'detail', id] as const,
    admin: (page: number, filters?: object) => [...queryKeys.violations.all, 'admin', page, filters] as const,
  },
  misinformation: {
    all: ['misinformation'] as const,
    list: (page: number, language?: string) => [...queryKeys.misinformation.all, 'list', page, language] as const,
    detail: (id: number) => [...queryKeys.misinformation.all, 'detail', id] as const,
    admin: (page: number, filters?: object) => [...queryKeys.misinformation.all, 'admin', page, filters] as const,
  },
  parties: {
    all: ['parties'] as const,
    list: (page: number) => [...queryKeys.parties.all, 'list', page] as const,
    detail: (id: number) => [...queryKeys.parties.all, 'detail', id] as const,
    admin: (page: number, filters?: object) => [...queryKeys.parties.all, 'admin', page, filters] as const,
  },
  infographics: {
    all: ['infographics'] as const,
    list: (page: number, language?: string) => [...queryKeys.infographics.all, 'list', page, language] as const,
    detail: (id: number) => [...queryKeys.infographics.all, 'detail', id] as const,
    admin: (page: number, filters?: object) => [...queryKeys.infographics.all, 'admin', page, filters] as const,
  },
  videos: {
    all: ['videos'] as const,
    list: (page: number, language?: string) => [...queryKeys.videos.all, 'list', page, language] as const,
    detail: (id: number) => [...queryKeys.videos.all, 'detail', id] as const,
    admin: (page: number, filters?: object) => [...queryKeys.videos.all, 'admin', page, filters] as const,
  },
  explainers: {
    all: ['explainers'] as const,
    list: (page: number, language?: string) => [...queryKeys.explainers.all, 'list', page, language] as const,
    detail: (id: number) => [...queryKeys.explainers.all, 'detail', id] as const,
    admin: (page: number, filters?: object) => [...queryKeys.explainers.all, 'admin', page, filters] as const,
  },
  announcements: {
    all: ['announcements'] as const,
    list: (page: number, filters?: object) => [...queryKeys.announcements.all, 'list', page, filters] as const,
    detail: (id: number) => [...queryKeys.announcements.all, 'detail', id] as const,
    admin: (page: number, filters?: object) => [...queryKeys.announcements.all, 'admin', page, filters] as const,
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

// ============ VIOLATIONS HOOKS ============

export const useViolations = (page = 1, language?: string) => {
  return useQuery({
    queryKey: queryKeys.violations.list(page, language),
    queryFn: () => violationsApi.getAll(page, 10, language),
  });
};

export const useViolationDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.violations.detail(id),
    queryFn: () => violationsApi.getById(id),
    enabled: !!id,
  });
};

export const useAdminViolations = (page = 1, filters?: { language?: string; published?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.violations.admin(page, filters),
    queryFn: () => violationsApi.adminGetAll(page, 10, filters),
  });
};

export const useCreateViolation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Violation>) => violationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.violations.all });
      toast.success('Violation created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create violation');
    },
  });
};

export const useUpdateViolation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Violation> }) => violationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.violations.all });
      toast.success('Violation updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update violation');
    },
  });
};

export const useDeleteViolation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => violationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.violations.all });
      toast.success('Violation deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete violation');
    },
  });
};

export const useToggleViolationPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => violationsApi.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.violations.all });
      toast.success('Publish status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle publish status');
    },
  });
};

// ============ MISINFORMATION HOOKS ============

export const useMisinformation = (page = 1, language?: string) => {
  return useQuery({
    queryKey: queryKeys.misinformation.list(page, language),
    queryFn: () => misinformationApi.getAll(page, 10, language),
  });
};

export const useMisinformationDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.misinformation.detail(id),
    queryFn: () => misinformationApi.getById(id),
    enabled: !!id,
  });
};

export const useAdminMisinformation = (page = 1, filters?: { language?: string; published?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.misinformation.admin(page, filters),
    queryFn: () => misinformationApi.adminGetAll(page, 10, filters),
  });
};

export const useCreateMisinformation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Misinformation>) => misinformationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.misinformation.all });
      toast.success('Misinformation created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create misinformation');
    },
  });
};

export const useUpdateMisinformation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Misinformation> }) => misinformationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.misinformation.all });
      toast.success('Misinformation updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update misinformation');
    },
  });
};

export const useDeleteMisinformation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => misinformationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.misinformation.all });
      toast.success('Misinformation deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete misinformation');
    },
  });
};

export const useToggleMisinformationPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => misinformationApi.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.misinformation.all });
      toast.success('Publish status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle publish status');
    },
  });
};

// ============ INFOGRAPHICS HOOKS ============

export const useInfographics = (page = 1, language?: string) => {
  return useQuery({
    queryKey: queryKeys.infographics.list(page, language),
    queryFn: () => infographicsApi.getAll(page, 10, language),
  });
};

export const useInfographicDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.infographics.detail(id),
    queryFn: () => infographicsApi.getById(id),
    enabled: !!id,
  });
};

export const useAdminInfographics = (page = 1, filters?: { language?: string; published?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.infographics.admin(page, filters),
    queryFn: () => infographicsApi.adminGetAll(page, 10, filters),
  });
};

export const useCreateInfographic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Infographic>) => infographicsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.infographics.all });
      toast.success('Infographic created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create infographic');
    },
  });
};

export const useUpdateInfographic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Infographic> }) => infographicsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.infographics.all });
      toast.success('Infographic updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update infographic');
    },
  });
};

export const useDeleteInfographic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => infographicsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.infographics.all });
      toast.success('Infographic deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete infographic');
    },
  });
};

export const useToggleInfographicPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => infographicsApi.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.infographics.all });
      toast.success('Publish status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle publish status');
    },
  });
};

// ============ VIDEOS HOOKS ============

export const useVideos = (page = 1, language?: string) => {
  return useQuery({
    queryKey: queryKeys.videos.list(page, language),
    queryFn: () => videosApi.getAll(page, 10, language),
  });
};

export const useVideoDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.videos.detail(id),
    queryFn: () => videosApi.getById(id),
    enabled: !!id,
  });
};

export const useAdminVideos = (page = 1, filters?: { language?: string; published?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.videos.admin(page, filters),
    queryFn: () => videosApi.adminGetAll(page, 10, filters),
  });
};

export const useCreateVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<VideoResource>) => videosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
      toast.success('Video created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create video');
    },
  });
};

export const useUpdateVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VideoResource> }) => videosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
      toast.success('Video updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update video');
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => videosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
      toast.success('Video deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete video');
    },
  });
};

export const useToggleVideoPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => videosApi.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
      toast.success('Publish status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle publish status');
    },
  });
};

// ============ EXPLAINERS HOOKS ============

export const useExplainers = (page = 1, language?: string) => {
  return useQuery({
    queryKey: queryKeys.explainers.list(page, language),
    queryFn: () => explainersApi.getAll(page, 10, language),
  });
};

export const useExplainerDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.explainers.detail(id),
    queryFn: () => explainersApi.getById(id),
    enabled: !!id,
  });
};

export const useAdminExplainers = (page = 1, filters?: { language?: string; published?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.explainers.admin(page, filters),
    queryFn: () => explainersApi.adminGetAll(page, 10, filters),
  });
};

export const useCreateExplainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Explainer>) => explainersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.explainers.all });
      toast.success('Explainer created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create explainer');
    },
  });
};

export const useUpdateExplainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Explainer> }) => explainersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.explainers.all });
      toast.success('Explainer updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update explainer');
    },
  });
};

export const useDeleteExplainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => explainersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.explainers.all });
      toast.success('Explainer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete explainer');
    },
  });
};

export const useToggleExplainerPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => explainersApi.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.explainers.all });
      toast.success('Publish status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle publish status');
    },
  });
};

// ============ ANNOUNCEMENTS HOOKS ============

export const useAnnouncements = (page = 1, filters?: { priority?: 'high' | 'medium' | 'low' }) => {
  return useQuery({
    queryKey: queryKeys.announcements.list(page, filters),
    queryFn: () => announcementsApi.getAll(page, 10, filters),
  });
};

export const useAdminAnnouncements = (page = 1, filters?: { priority?: 'high' | 'medium' | 'low'; published?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.announcements.admin(page, filters),
    queryFn: () => announcementsApi.adminGetAll(page, 10, filters),
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Announcement>) => announcementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      toast.success('Announcement created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create announcement');
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Announcement> }) => announcementsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      toast.success('Announcement updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update announcement');
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => announcementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      toast.success('Announcement deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete announcement');
    },
  });
};

export const useToggleAnnouncementPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => announcementsApi.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      toast.success('Publish status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle publish status');
    },
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
