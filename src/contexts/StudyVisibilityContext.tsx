import { createContext, useContext } from 'react'

export const StudyVisibilityContext = createContext<boolean>(true)

export function useStudyVisibility(): boolean {
  return useContext(StudyVisibilityContext)
}
