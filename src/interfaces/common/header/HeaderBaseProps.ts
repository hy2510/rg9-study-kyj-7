import { HeaderVariant } from '@interfaces/common/header/HeaderVariant'
import { ViewType } from '@interfaces/common/ViewType'

export type HeaderBaseProps = {
  variant: HeaderVariant
  bookCode: string
  bookTitle?: string
  keywords?: string
  changeCurrentView: (view: ViewType) => void
  closeMenuSignal?: unknown
  hideMenu?: boolean
}
