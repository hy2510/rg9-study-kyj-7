import { useEffect, useState } from 'react'

import styled from 'styled-components'

import Divider from '@components/atoms/common/Divider'
import { IconChevronDown } from '@components/atoms/common/icons/IconChevronDown'
import { IconChevronUp } from '@components/atoms/common/icons/IconChevronUp'
import Stack from '@components/atoms/common/Stack'
import type { HeaderLegacyStudyProps } from '@interfaces/common/header/HeaderLegacyStudyProps'
import type { LegacyQuizMark } from '@interfaces/common/header/LegacyQuizMark'
import type { LegacyStepProgress } from '@interfaces/common/header/LegacyStepProgress'
import { formatActivityLabel } from '@utils/study/formatActivityLabel'

import StudyBottomNavSection from './StudyBottomNavSection'

const ATTEMPT_COLUMN_LABELS = ['1st', '2nd', '3rd'] as const

type LegacyStudyMenuSectionsProps = {
  studyProps: HeaderLegacyStudyProps
  onNavigateStoryStudy: () => void
  onExitStudy: () => void
  closeMenu: () => void
}

export default function LegacyStudyMenuSections({
  studyProps,
  onNavigateStoryStudy,
  onExitStudy,
  closeMenu,
}: LegacyStudyMenuSectionsProps) {
  const handleOpenVocaCards = () => {
    studyProps.onOpenVocaCards?.()
    closeMenu()
  }

  return (
    <Stack gap={18}>
      <LegacyStudyProgressSection
        studyProps={studyProps}
        closeMenu={closeMenu}
      />
      <Divider />
      <StudyBottomNavSection
        isBookTypePB={studyProps.isBookTypePB}
        onNavigateStoryStudy={onNavigateStoryStudy}
        onExitStudy={onExitStudy}
        showVocaCardsMenu={studyProps.showVocaCardsMenu}
        onOpenVocaCards={handleOpenVocaCards}
      />
    </Stack>
  )
}

type LegacyStudyProgressSectionProps = {
  studyProps: HeaderLegacyStudyProps
  closeMenu: () => void
}

function LegacyStudyProgressSection({
  studyProps,
  closeMenu,
}: LegacyStudyProgressSectionProps) {
  const {
    openSteps,
    currentStepId,
    stepProgressMap,
    mappedStepActivity,
    onNavigateStep,
  } = studyProps

  const initialOpenIdx = Math.max(
    0,
    openSteps.findIndex((stepId) => stepId === currentStepId),
  )
  const [openCardIndex, setOpenCardIndex] = useState<number>(initialOpenIdx)

  useEffect(() => {
    const idx = openSteps.findIndex((stepId) => stepId === currentStepId)
    if (idx >= 0) setOpenCardIndex(idx)
  }, [currentStepId, openSteps])

  const toggleCard = (idx: number) => {
    setOpenCardIndex((prev) => (prev === idx ? -1 : idx))
  }

  const handleHeadClick = (stepId: number, cardIndex: number) => {
    if (onNavigateStep && stepId !== currentStepId) {
      onNavigateStep(stepId)
      closeMenu()
      return
    }
    toggleCard(cardIndex)
  }

  return (
    <Stack gap={12}>
      {openSteps.map((stepId, cardIndex) => {
        const isOpen = openCardIndex === cardIndex
        const progress = stepProgressMap[stepId]
        const activityLabel = formatActivityLabel(
          mappedStepActivity[stepId - 1] ?? '',
        )

        const isCurrent = stepId === currentStepId

        return (
          <StudyCard key={stepId} $isCurrent={isCurrent}>
            <StudyHead
              type='button'
              onClick={() => handleHeadClick(stepId, cardIndex)}
              aria-expanded={isOpen}
              $isCurrent={isCurrent}
              $isOpen={isOpen}
            >
              <StudyHeadLabel>
                {activityLabel}
              </StudyHeadLabel>
              {isOpen ? (
                <IconChevronUp width={16} height={16} alt='' />
              ) : (
                <IconChevronDown width={16} height={16} alt='' />
              )}
            </StudyHead>
            {isOpen && <StudyBody progress={progress} />}
          </StudyCard>
        )
      })}
    </Stack>
  )
}

type StudyBodyProps = {
  progress: LegacyStepProgress | undefined
}

function StudyBody({ progress }: StudyBodyProps) {
  const quizCount = progress?.quizCount ?? 0
  const quizAnswerCount = progress?.quizAnswerCount ?? 0
  const attempts = progress?.attempts ?? []

  if (quizCount <= 0 || quizAnswerCount <= 0) {
    return (
      <StudyTable $attemptCount={1}>
        <tbody>
          <tr>
            <td>-</td>
            <td>-</td>
          </tr>
        </tbody>
      </StudyTable>
    )
  }

  return (
    <StudyTable $attemptCount={quizAnswerCount}>
      <thead>
        <tr>
          <th>#</th>
          {Array.from({ length: quizAnswerCount }).map((_, i) => (
            <th key={i}>{ATTEMPT_COLUMN_LABELS[i] ?? `${i + 1}`}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: quizCount }).map((_, qi) => {
          const row = attempts[qi] ?? []
          return (
            <tr key={qi}>
              <td>{`Q ${qi + 1}`}</td>
              {Array.from({ length: quizAnswerCount }).map((_, ai) => (
                <td key={ai}>
                  <Mark mark={row[ai] ?? ''} />
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </StudyTable>
  )
}

function Mark({ mark }: { mark: LegacyQuizMark | '' }) {
  if (mark === 'O') return <MarkText $variant='correct'>O</MarkText>
  if (mark === 'X') return <MarkText $variant='incorrect'>X</MarkText>
  return null
}

const StudyCard = styled.div<{ $isCurrent: boolean }>`
  border: 1.5px solid ${({ $isCurrent }) => ($isCurrent ? '#3c4b62' : '#e9edf3')};
  border-radius: 20px;
  overflow: hidden;
`

const StudyHead = styled.button<{ $isCurrent: boolean; $isOpen: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border: none;
  border-bottom: ${({ $isCurrent, $isOpen }) =>
    !$isCurrent && $isOpen ? '1.5px solid #dfe5ed' : 'none'};
  background: ${({ $isCurrent }) =>
    $isCurrent ? '#3c4b62' : 'rgba(233, 237, 243, 0.5)'};
  padding: 12px 14px;
  font-family: 'Rg-B', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ $isCurrent }) => ($isCurrent ? '#fff' : '#a2b1c4')};
  cursor: pointer;

  img {
    filter: ${({ $isCurrent }) =>
      $isCurrent
        ? 'brightness(0) invert(1)'
        : 'brightness(0) saturate(100%) invert(73%) sepia(8%) saturate(431%) hue-rotate(176deg) brightness(94%) contrast(85%)'};
  }
`

const StudyHeadLabel = styled.span`
  min-width: 0;
  text-align: left;
  line-height: 1.35;
`

const StudyTable = styled.table<{ $attemptCount: number }>`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;

  thead,
  tbody {
    tr {
      display: grid;
      grid-template-columns: ${({ $attemptCount }) =>
        `60px ${'1fr '.repeat($attemptCount).trim()}`};

      th,
      td {
        font-family: 'Rg-B', sans-serif;
        font-size: 0.9em;
        text-align: center;
        padding: 8px 10px;
        min-height: 1em;
      }

      th {
        font-weight: 600;
        color: #a2b1c4;
        background-color: #fafbfd;
        border-bottom: 1.5px solid #e9edf3;
      }

      td {
        border-top: 1.5px solid #e9edf3;

        &:first-child {
          color: #a2b1c4;
        }
      }
    }
  }

  tbody tr:first-child td {
    border-top: none;
  }
`

const MarkText = styled.span<{ $variant: 'correct' | 'incorrect' }>`
  font-weight: 700;
  color: ${({ $variant }) =>
    $variant === 'correct' ? '#20ad75' : '#ef3d64'};
`
