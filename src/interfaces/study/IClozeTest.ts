interface IClozeTest1Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Sound: string
  }
  Examples: IClozeTest1Example[]
}
interface IClozeTest1Example {
  Text: string
}
interface IClozeTest1 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  Quiz: IClozeTest1Quiz[]
}

interface IClozeTest2 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  readonly IsEnablePenaltyReview: boolean
  Quiz: IClozeTest2Quiz[]
}
interface IClozeTest2Example {
  Text: string
}
interface IClozeTest2Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Sound: string
  }
  Examples: IClozeTest2Example[]
}

interface IClozeTest3 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  readonly IsEnablePenaltyReview: boolean
  Quiz: IClozeTest3Quiz[]
}
interface IClozeTest3Example {
  Text: string
}
interface IClozeTest3Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Sound: string
  }
  Examples: IClozeTest3Example[]
}

export type {
  IClozeTest1,
  IClozeTest1Example,
  IClozeTest1Quiz,
  IClozeTest2,
  IClozeTest2Example,
  IClozeTest2Quiz,
  IClozeTest3,
  IClozeTest3Example,
  IClozeTest3Quiz,
}
