import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

interface MultiTabBlockContextType {
  currentTabId: string
}

export const MultiTabBlockContext = createContext<MultiTabBlockContextType>({
  currentTabId: '',
})

export function MultiTabBlockContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const TAB_IDS_KEY = 'tab_ids'

  const [currentTabId, setCurrentTabId] = useState<string>('')
  const currentTabIdRef = useRef<string>('')

  useEffect(() => {
    const newTabId = Math.random().toString(36).slice(2)

    const tabIdList = JSON.parse(localStorage.getItem(TAB_IDS_KEY) || '[]')

    tabIdList.push(newTabId)
    localStorage.setItem(TAB_IDS_KEY, JSON.stringify(tabIdList))

    currentTabIdRef.current = newTabId
    setCurrentTabId(newTabId)
    sessionStorage.setItem('current_tab_id', newTabId)
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TAB_IDS_KEY) {
        const isMultiTab = JSON.parse(e.newValue || '[]').length > 1
        const tabIds = JSON.parse(e.newValue || '[]')
        const lastTabId = tabIds[tabIds.length - 1]

        if (isMultiTab && lastTabId && lastTabId !== currentTabIdRef.current) {
          window.onExitStudy()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const cleanup = () => {
      const tabIds = JSON.parse(localStorage.getItem(TAB_IDS_KEY) || '[]')
      const updatedTabIds = tabIds.filter(
        (id: string) => id !== currentTabIdRef.current,
      )
      localStorage.setItem(TAB_IDS_KEY, JSON.stringify(updatedTabIds))
      sessionStorage.removeItem('current_tab_id')
    }

    window.addEventListener('beforeunload', cleanup)
    return () => {
      cleanup()
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [])

  return (
    <MultiTabBlockContext.Provider
      value={{
        currentTabId,
      }}
    >
      {children}
    </MultiTabBlockContext.Provider>
  )
}

export function useMultiTabBlock() {
  const context = useContext(MultiTabBlockContext)
  if (!context) {
    throw new Error(
      'useMultiTabBlock must be used within a MultiTabBlockContextProvider',
    )
  }
  return context
}
