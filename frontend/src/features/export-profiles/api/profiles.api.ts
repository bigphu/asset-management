import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ExportProfile, ExportProfileInput } from '../types'
import { mockProfiles } from './mockProfiles'

// Mock "backend" — see the note in `features/assets/api/assets.api.ts`; the
// same pattern applies here once saved profiles have a real endpoint
// (ADR-0013: per-user database record).

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

async function fetchProfiles(): Promise<ExportProfile[]> {
  return delay(mockProfiles)
}

async function createProfile(input: ExportProfileInput): Promise<ExportProfile> {
  const created: ExportProfile = { id: `profile-${Date.now()}`, ...input }
  mockProfiles.push(created)
  return delay(created)
}

async function updateProfile(id: string, input: ExportProfileInput): Promise<ExportProfile> {
  const index = mockProfiles.findIndex((p) => p.id === id)
  const updated: ExportProfile = { id, ...input }
  if (index !== -1) mockProfiles[index] = updated
  return delay(updated)
}

async function deleteProfile(id: string): Promise<void> {
  const index = mockProfiles.findIndex((p) => p.id === id)
  if (index !== -1) mockProfiles.splice(index, 1)
  return delay(undefined)
}

export const profileKeys = {
  all: ['export-profiles'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
}

export function useProfilesQuery() {
  return useQuery({
    queryKey: profileKeys.lists(),
    queryFn: fetchProfiles,
  })
}

export function useCreateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ExportProfileInput) => createProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.lists() }),
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExportProfileInput }) =>
      updateProfile(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.lists() }),
  })
}

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.lists() }),
  })
}
