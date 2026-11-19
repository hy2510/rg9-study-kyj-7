import { Mode } from '@src/interfaces/common/Types'

export type UserRole = 'student' | 'staff'

export interface ResolveStudyModeParams {
  isGuide: boolean
  isPreviewMode: boolean
  isTrialMode: boolean
  userRole: UserRole
  isReview: boolean
}

export function resolveStudyMode(params: ResolveStudyModeParams): Mode {
  if (params.isGuide) return 'guide'
  if (params.isPreviewMode) return 'preview'
  if (params.isTrialMode) return 'trial'
  if (params.userRole === 'staff') return 'staff'
  if (params.isReview) return 'review'
  return 'student'
}

export function normalizeUserRole(rawUser: unknown): UserRole {
  return rawUser === 'staff' ? 'staff' : 'student'
}
