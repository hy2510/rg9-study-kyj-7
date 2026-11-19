interface IListeningActivity1Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Sound: string
  }
}
interface IListeningActivity1Example {
  Text: string
  Image: string
  IsCorrected?: boolean
}
interface IListeningActivity1 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  Quiz: IListeningActivity1Quiz[]
  Examples: IListeningActivity1Example[]
}

interface IListeningActivity2Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Sound: string
  }
}
interface IListeningActivity2Example {
  Text: string
  IsCorrected?: boolean
}
interface IListeningActivity2 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  Quiz: IListeningActivity2Quiz[]
  Examples: IListeningActivity2Example[]
}

interface IListeningActivity3Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Sound: string
  }
  Examples: IListeningActivity3Example[]
}
interface IListeningActivity3Example {
  Text: string
  Image: string
}
interface IListeningActivity3 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  Quiz: IListeningActivity3Quiz[]
}

interface IListeningActivity4Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Image: string
  }
  Examples: IListeningActivity4Example[]
}
interface IListeningActivity4Example {
  Text: string
  Sound: string
}
interface IListeningActivity4 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  Quiz: IListeningActivity4Quiz[]
}

export type {
  IListeningActivity1,
  IListeningActivity1Example,
  IListeningActivity1Quiz,
  IListeningActivity2,
  IListeningActivity2Example,
  IListeningActivity2Quiz,
  IListeningActivity3,
  IListeningActivity3Example,
  IListeningActivity3Quiz,
  IListeningActivity4,
  IListeningActivity4Example,
  IListeningActivity4Quiz,
}
