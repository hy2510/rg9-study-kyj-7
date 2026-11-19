import axios from 'axios'

import {
  GET_BOOK_DATA_PATH,
  SUBMIT_ANIMATION_COMPLETE_PATH,
  SUBMIT_ANIMATION_COMPLETE_PATH_NB,
  SUBMIT_BOOK_MARK_PATH,
  SUBMIT_PREFERENCE_PATH,
  SUBMIT_READING_END_PATH,
  SUBMIT_READING_START_PATH,
} from '@src/constants/study/studyConstants'
import { IResultPreference } from '@src/interfaces/common/Common'
import { PageProps } from '@src/interfaces/story/IStory'
import { toTrialApiPath } from '@utils/study/trialApiPath'

async function getStoryInfo(
  studyId: string,
  studentHistoryId: string,
): Promise<PageProps[]> {
  const requestUrl = `/${toTrialApiPath(GET_BOOK_DATA_PATH)}?studentHistoryId=${studentHistoryId}&studyId=${studyId}`
  let storyInfo: PageProps[]

  try {
    const res = await axios.get(requestUrl)

    if (res.status >= 200 && res.status < 300) {
      const response = res.data

      storyInfo = await response
    } else {
      throw new Error('Get Story Data Failed 1')
    }
  } catch (e) {
    console.error(e)
    throw new Error('Get Story Data Failed 2')
  }

  return storyInfo
}

async function submitReadFirstPage(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_READING_START_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

async function submitReadLastPage(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_READING_END_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

async function saveBookMark(
  studyId: string,
  studentHistoryId: string,
  page: number,
) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_BOOK_MARK_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
      page: page,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

async function submitWatchMovie(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_ANIMATION_COMPLETE_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

async function submitWatchMovieNB(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_ANIMATION_COMPLETE_PATH_NB}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

async function submitPreference(
  mode: string,
  studyId: string,
  studentHistoryId: string,
  preference: number,
): Promise<IResultPreference> {
  if (mode !== 'student') return { success: true }
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_PREFERENCE_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
      preference: preference,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

export {
  getStoryInfo,
  saveBookMark,
  submitPreference,
  submitReadFirstPage,
  submitReadLastPage,
  submitWatchMovie,
}
