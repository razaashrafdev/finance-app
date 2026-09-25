import { apiRequest } from './client';

export type AuthUser = {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export type AuthProfile = {
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
} | null;

type SessionPayload = {
  access_token?: string;
  refresh_token?: string;
  user?: AuthUser;
  session?: {
    access_token?: string;
    refresh_token?: string;
    user?: AuthUser;
  } | null;
};

function readTokens(data: SessionPayload | undefined) {
  const accessToken = data?.session?.access_token || data?.access_token || '';
  const refreshToken = data?.session?.refresh_token || data?.refresh_token || '';
  const user = data?.session?.user || data?.user || null;
  return { accessToken, refreshToken, user };
}

export async function signUp(email: string, password: string, fullName: string) {
  const payload = await apiRequest<{ data: SessionPayload; message?: string }>('/api/auth/signup', {
    method: 'POST',
    auth: false,
    body: { email, password, fullName },
  });
  return { ...readTokens(payload.data), message: payload.message };
}

export async function verifySignupCode(email: string, code: string) {
  const payload = await apiRequest<{ data: SessionPayload; message?: string }>('/api/auth/verify-email', {
    method: 'POST',
    auth: false,
    body: { email, code },
  });
  return readTokens(payload.data);
}

export async function resendSignupCode(email: string) {
  await apiRequest('/api/auth/resend-verification', {
    method: 'POST',
    auth: false,
    body: { email },
  });
}

export async function signIn(email: string, password: string) {
  const payload = await apiRequest<{ data: SessionPayload; message?: string }>('/api/auth/signin', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
  return readTokens(payload.data);
}

export async function signOut() {
  await apiRequest('/api/auth/signout', { method: 'POST' });
}

export async function forgotPassword(email: string) {
  await apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: { email },
  });
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  await apiRequest('/api/auth/reset-password', {
    method: 'POST',
    auth: false,
    body: { email, code, newPassword },
  });
}

export async function getMe() {
  return apiRequest<{ user: AuthUser; profile: AuthProfile }>('/api/auth/me');
}

export async function updateProfile(input: { fullName?: string; email?: string; avatarUrl?: string }) {
  return apiRequest<{ data: AuthProfile; message?: string }>('/api/auth/profile', {
    method: 'PUT',
    body: input,
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await apiRequest('/api/auth/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword },
  });
}

export type FinanceDataPayload = {
  encryptedPayload: string;
  payloadVersion: number;
  encryptionVersion?: number;
  payloadHash?: string;
};

export type FinanceDataResponse = {
  exists: boolean;
  data: {
    encryptedPayload: string;
    payloadVersion: number;
    encryptionVersion: number;
    payloadHash: string | null;
    updatedAt: string;
  } | null;
};

/** Load the authenticated user's encrypted FinanceFlow snapshot from Supabase. */
export async function getFinanceData() {
  return apiRequest<FinanceDataResponse>('/api/finance/data', { method: 'GET' });
}

/** Upsert the authenticated user's encrypted FinanceFlow snapshot. */
export async function putFinanceData(payload: FinanceDataPayload) {
  return apiRequest<{ message: string; payloadVersion: number; updatedAt: string }>('/api/finance/data', {
    method: 'PUT',
    body: payload,
  });
}
