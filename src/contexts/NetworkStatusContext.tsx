import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

interface NetworkStatusContextType {
  isOnline: boolean
}

const NetworkStatusContext = createContext<
  NetworkStatusContextType | undefined
>(undefined)

interface NetworkStatusProviderProps {
  children: ReactNode
}

export function NetworkStatusProvider({
  children,
}: NetworkStatusProviderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  )
}

export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext)
  if (!context) {
    throw new Error(
      'useNetworkStatus는 NetworkStatusProvider 내에서만 사용해야 합니다.',
    )
  }
  return context
}
