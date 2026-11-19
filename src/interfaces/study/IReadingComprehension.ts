interface IReadingComprehension1Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Sound: string
  }
  Examples: IReadingComprehension1Example[]
}
interface IReadingComprehension1Example {
  Text: string
  Image: string
}
interface IReadingComprehension1 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  Quiz: IReadingComprehension1Quiz[]
}

interface IReadingComprehension2Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Image: string
  }
  Examples: IReadingComprehension2Example[]
}
interface IReadingComprehension2Example {
  Text: string
  Sound: string
}
interface IReadingComprehension2 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  Quiz: IReadingComprehension2Quiz[]
}

interface IReadingComprehension3Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Image: string
    Sound: string
  }
  Examples: IReadingComprehension3Example[]
}
interface IReadingComprehension3Example {
  Text: string
  Sound: string
}
interface IReadingComprehension3 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  Quiz: IReadingComprehension3Quiz[]
}

interface IReadingComprehension4Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Sound?: string
  }
  Examples: IReadingComprehension4Example[]
}
interface IReadingComprehension4Example {
  Text: string
}
interface IReadingComprehension4 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  readonly PassMark: number
  readonly IsHideQuestionText: boolean
  Quiz: IReadingComprehension4Quiz[]
}

export type {
  IReadingComprehension1,
  IReadingComprehension1Example,
  IReadingComprehension1Quiz,
  IReadingComprehension2,
  IReadingComprehension2Example,
  IReadingComprehension2Quiz,
  IReadingComprehension3,
  IReadingComprehension3Example,
  IReadingComprehension3Quiz,
  IReadingComprehension4,
  IReadingComprehension4Example,
  IReadingComprehension4Quiz,
}
