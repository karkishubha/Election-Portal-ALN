/**
 * API Service Configuration
 * Nepal Election Portal Frontend
 * 
 * Central API configuration and axios instance.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management
const getToken = (): string | null => {
  return localStorage.getItem('adminToken');
};

const setToken = (token: string): void => {
  localStorage.setItem('adminToken', token);
};

const removeToken = (): void => {
  localStorage.removeItem('adminToken');
};

// Error logger for debugging
const logApiError = (endpoint: string, error: unknown): void => {
  const timestamp = new Date().toISOString();
  console.error(`[API Error] ${timestamp}`);
  console.error(`Endpoint: ${API_BASE_URL}${endpoint}`);
  if (error instanceof Error) {
    console.error(`Message: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
  } else {
    console.error(`Error:`, error);
  }
};

// Generic fetch wrapper with auth
const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      logApiError(endpoint, parseError);
      throw new Error('Server returned an invalid response');
    }

    if (!response.ok) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      console.error(`[API] ${response.status} ${response.statusText}: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Network errors (no response from server)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      logApiError(endpoint, error);
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    
    // Re-throw if already handled
    if (error instanceof Error) {
      throw error;
    }
    
    // Unknown error
    logApiError(endpoint, error);
    throw new Error('An unexpected error occurred');
  }
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Auth types
export interface AdminUser {
  id: number;
  email: string;
  role: string;
}

export interface LoginResponse {
  admin: AdminUser;
  token: string;
}

// Content types
export interface VoterEducation {
  id: number;
  title: string;
  description: string;
  pdfUrl: string;
  language: 'en' | 'ne' | 'other';
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ElectionIntegrity {
  id: number;
  title: string;
  description: string;
  pdfUrl: string;
  category: string;
  language: 'en' | 'ne' | 'other';
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Newsletter {
  id: number;
  title: string;
  summary: string;
  pdfUrl: string;
  source: 'ALN' | 'DRN' | 'ALN_DRN' | 'other';
  publishedDate: string;
  language: 'en' | 'ne' | 'other';
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PoliticalParty {
  id: number;
  partyName: string;
  partyNameNepali?: string;
  abbreviation?: string;
  partySymbolUrl?: string;
  officialWebsite?: string;
  manifestoPdfUrl?: string;
  prListPdfUrl?: string;
  description?: string;
  displayOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicStats {
  totalResources: number;
  voterEducation: number;
  electionIntegrity: number;
  newsletters: number;
  politicalParties: number;
  partnerOrganizations: number;
  electionYear: string;
  accessHours: string;
}

export interface RecentActivity {
  type: 'voter-education' | 'election-integrity' | 'newsletter' | 'political-party';
  title: string;
  action: 'Created' | 'Updated';
  timestamp: string;
}

export interface AdminStats {
  voterEducation: { total: number; published: number; unpublished: number };
  electionIntegrity: { total: number; published: number; unpublished: number };
  newsletters: { total: number; published: number; unpublished: number };
  politicalParties: { total: number; published: number; unpublished: number };
  totals: { resources: number; published: number; parties: number };
  recentActivity: RecentActivity[];
}

export interface Category {
  value: string;
  label: string;
}

// ============ STATS API ============
export const statsApi = {
  getPublic: async (): Promise<ApiResponse<PublicStats>> => {
    return apiFetch('/stats');
  },
  getAdmin: async (): Promise<ApiResponse<AdminStats>> => {
    return apiFetch('/stats/admin');
  },
};

// ============ AUTH API ============
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const data = await apiFetch<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.success && data.data.token) {
      setToken(data.data.token);
    }
    return data;
  },

  logout: (): void => {
    removeToken();
  },

  getMe: async (): Promise<ApiResponse<{ admin: AdminUser }>> => {
    return apiFetch('/auth/me');
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    return apiFetch('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  isLoggedIn: (): boolean => {
    return !!getToken();
  },
};

// ============ VOTER EDUCATION API ============
export const voterEducationApi = {
  // Public
  getAll: async (page = 1, limit = 10, language?: string): Promise<PaginatedResponse<VoterEducation>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (language) params.append('language', language);
    return apiFetch(`/voter-education?${params}`);
  },

  getById: async (id: number): Promise<ApiResponse<VoterEducation>> => {
    return apiFetch(`/voter-education/${id}`);
  },

  // Admin
  adminGetAll: async (page = 1, limit = 10, filters?: { language?: string; published?: boolean }): Promise<PaginatedResponse<VoterEducation>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.language) params.append('language', filters.language);
    if (filters?.published !== undefined) params.append('published', String(filters.published));
    return apiFetch(`/admin/voter-education?${params}`);
  },

  create: async (data: Partial<VoterEducation>): Promise<ApiResponse<VoterEducation>> => {
    return apiFetch('/admin/voter-education', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<VoterEducation>): Promise<ApiResponse<VoterEducation>> => {
    return apiFetch(`/admin/voter-education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiFetch(`/admin/voter-education/${id}`, {
      method: 'DELETE',
    });
  },

  togglePublish: async (id: number): Promise<ApiResponse<VoterEducation>> => {
    return apiFetch(`/admin/voter-education/${id}/publish`, {
      method: 'PATCH',
    });
  },
};

// ============ ELECTION INTEGRITY API ============
export const electionIntegrityApi = {
  // Public
  getAll: async (page = 1, limit = 10, filters?: { category?: string; language?: string }): Promise<PaginatedResponse<ElectionIntegrity>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.category) params.append('category', filters.category);
    if (filters?.language) params.append('language', filters.language);
    return apiFetch(`/election-integrity?${params}`);
  },

  getById: async (id: number): Promise<ApiResponse<ElectionIntegrity>> => {
    return apiFetch(`/election-integrity/${id}`);
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return apiFetch('/election-integrity/categories');
  },

  // Admin
  adminGetAll: async (page = 1, limit = 10, filters?: { category?: string; language?: string; published?: boolean }): Promise<PaginatedResponse<ElectionIntegrity>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.category) params.append('category', filters.category);
    if (filters?.language) params.append('language', filters.language);
    if (filters?.published !== undefined) params.append('published', String(filters.published));
    return apiFetch(`/admin/election-integrity?${params}`);
  },

  create: async (data: Partial<ElectionIntegrity>): Promise<ApiResponse<ElectionIntegrity>> => {
    return apiFetch('/admin/election-integrity', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<ElectionIntegrity>): Promise<ApiResponse<ElectionIntegrity>> => {
    return apiFetch(`/admin/election-integrity/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiFetch(`/admin/election-integrity/${id}`, {
      method: 'DELETE',
    });
  },

  togglePublish: async (id: number): Promise<ApiResponse<ElectionIntegrity>> => {
    return apiFetch(`/admin/election-integrity/${id}/publish`, {
      method: 'PATCH',
    });
  },
};

// ============ NEWSLETTERS API ============
export const newslettersApi = {
  // Public
  getAll: async (page = 1, limit = 10, filters?: { source?: string; language?: string }): Promise<PaginatedResponse<Newsletter>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.source) params.append('source', filters.source);
    if (filters?.language) params.append('language', filters.language);
    return apiFetch(`/newsletters?${params}`);
  },

  getById: async (id: number): Promise<ApiResponse<Newsletter>> => {
    return apiFetch(`/newsletters/${id}`);
  },

  // Admin
  adminGetAll: async (page = 1, limit = 10, filters?: { source?: string; language?: string; published?: boolean }): Promise<PaginatedResponse<Newsletter>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.source) params.append('source', filters.source);
    if (filters?.language) params.append('language', filters.language);
    if (filters?.published !== undefined) params.append('published', String(filters.published));
    return apiFetch(`/admin/newsletters?${params}`);
  },

  create: async (data: Partial<Newsletter>): Promise<ApiResponse<Newsletter>> => {
    return apiFetch('/admin/newsletters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Newsletter>): Promise<ApiResponse<Newsletter>> => {
    return apiFetch(`/admin/newsletters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiFetch(`/admin/newsletters/${id}`, {
      method: 'DELETE',
    });
  },

  togglePublish: async (id: number): Promise<ApiResponse<Newsletter>> => {
    return apiFetch(`/admin/newsletters/${id}/publish`, {
      method: 'PATCH',
    });
  },
};

// ============ POLITICAL PARTIES API ============
export const partiesApi = {
  // Public
  getAll: async (page = 1, limit = 50): Promise<PaginatedResponse<PoliticalParty>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiFetch(`/parties?${params}`);
  },

  getById: async (id: number): Promise<ApiResponse<PoliticalParty>> => {
    return apiFetch(`/parties/${id}`);
  },

  // Admin
  adminGetAll: async (page = 1, limit = 50, filters?: { published?: boolean }): Promise<PaginatedResponse<PoliticalParty>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.published !== undefined) params.append('published', String(filters.published));
    return apiFetch(`/admin/parties?${params}`);
  },

  create: async (data: Partial<PoliticalParty>): Promise<ApiResponse<PoliticalParty>> => {
    return apiFetch('/admin/parties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<PoliticalParty>): Promise<ApiResponse<PoliticalParty>> => {
    return apiFetch(`/admin/parties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiFetch(`/admin/parties/${id}`, {
      method: 'DELETE',
    });
  },

  togglePublish: async (id: number): Promise<ApiResponse<PoliticalParty>> => {
    return apiFetch(`/admin/parties/${id}/publish`, {
      method: 'PATCH',
    });
  },
};

// ============ FILE UPLOAD API ============
export const uploadApi = {
  uploadPdf: async (file: File, type: string): Promise<ApiResponse<{ url: string; filename: string }>> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/pdf?type=${type}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  },
};

// ============ HEALTH CHECK ============
export const healthApi = {
  check: async (): Promise<{ success: boolean; message: string }> => {
    return apiFetch('/health');
  },
};

export { getToken, setToken, removeToken, API_BASE_URL };
