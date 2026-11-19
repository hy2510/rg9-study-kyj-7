import { useQuizTimeoutSignal } from '@hooks/study/legacy/useQuizTimeoutSignal'

type QuizTimeoutListenerProps = {
  signal: number | undefined
  onTimeout: () => void
}

export default function QuizTimeoutListener({
  signal,
  onTimeout,
}: QuizTimeoutListenerProps) {
  useQuizTimeoutSignal(signal, onTimeout)
  return null
}
