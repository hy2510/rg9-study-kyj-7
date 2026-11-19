import { Suspense } from 'react'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import AppContextProvider from '@contexts/AppContext'
import { MultiTabBlockContextProvider } from '@contexts/MultiTabBlockContext'
import { NetworkStatusProvider } from '@contexts/NetworkStatusContext'
import { useSafeAreaInsetSync } from '@hooks/useSafeAreaInsetSync'
import InfoContainer from '@pages/InfoContainer'

export default function App() {
  useSafeAreaInsetSync()

  return (
    <AppContextProvider>
      <Suspense fallback={<CenteredLoading fillViewport />}>
        <NetworkStatusProvider>
          <MultiTabBlockContextProvider>
            <InfoContainer />
          </MultiTabBlockContextProvider>
        </NetworkStatusProvider>
      </Suspense>
    </AppContextProvider>
  )
}
