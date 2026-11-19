import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

type RevisionReportProps = {
  revisionImageTop?: string
  revisionImageBottom?: string
  comment?: string
}

export default function RevisionReport({
  revisionImageTop,
  revisionImageBottom,
  comment,
}: RevisionReportProps) {
  const hasAny = Boolean(revisionImageTop || revisionImageBottom || comment)
  if (!hasAny) return null

  return (
    <Wrapper>
      {revisionImageTop ? (
        <RevisionImage src={revisionImageTop} alt='' loading='lazy' />
      ) : null}
      {revisionImageBottom ? (
        <RevisionImage src={revisionImageBottom} alt='' loading='lazy' />
      ) : null}
      {comment ? <Comment>{comment}</Comment> : null}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  max-height: 40vh;
  overflow-y: auto;
  background-color: #fff;
  border: 1.5px solid #e9edf3;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  ${media.mobile} {
    padding: 14px;
    max-height: 35vh;
    border-radius: 16px;
  }
`

const RevisionImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 12px;
`

const Comment = styled.p`
  margin: 0;
  font-family: 'Rg-R', 'Fredoka', sans-serif;
  font-size: 15px;
  line-height: 1.5;
  color: #3c4b62;
  white-space: pre-wrap;
`
