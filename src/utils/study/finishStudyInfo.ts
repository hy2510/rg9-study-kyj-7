import { IResultType } from '@src/interfaces/common/Common'

const FINISH_STUDY_INFO_KEY = 'finishStudyInfo'

export function captureFinishStudyInfoFromResult(res: IResultType): void {
  if (Number(res.result) !== 0) return
  if (!res.resultMessage) return
  window.sessionStorage.setItem(
    FINISH_STUDY_INFO_KEY,
    JSON.stringify({
      id: Number(res.result),
      cause: res.resultMessage,
    }),
  )
}
