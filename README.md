# readinggate-study-9th

## 로컬 실행

학습 앱(이 폴더):

```sh
npm ci
npm run dev
```

홈페이지(`../rg8-homepage-wis-7`):

```sh
npm run dev -- --hostname 0.0.0.0 --port 3000
```

브라우저에서 `http://localhost:3000`으로 접속한 뒤 EB/PB 도서의 Start를 누릅니다.
홈페이지는 `/study/BookReading/*`를 이 앱의 3030 포트로 전달합니다.
3030 주소를 직접 열면 홈페이지의 도서 정보(REF)가 없어 학습을 시작할 수 없습니다.
휴대폰은 같은 Wi-Fi에서 `http://<PC의 LAN IP>:3000`으로 접속합니다.
학습 UI 변경은 Vite HMR로 반영되므로 3030 포트도 접근 가능해야 합니다.
HTTP LAN 접속에서는 마이크 녹음에 제한이 있으므로 실제 녹음 검증에는 신뢰할 수 있는 HTTPS가 필요합니다.

# 참고자료

화면 기획 : https://www.figma.com/slides/Ru60tXknS2wwySIYSen4NG/RG-9%EC%B0%A8-%ED%95%99%EC%8A%B5-%EC%8B%9C%EB%82%98%EB%A6%AC%EC%98%A4---%EA%B8%B0%ED%9A%8D-%EC%88%98%EC%A0%95--2025.12.17-?node-id=1-95&t=3kwpUJn7vTyYpXdV-0

학습 방식 : https://app.notion.com/p/37910d0241c080988d0ce58c4bea9247

<br>

# 특이 사항

1. 별점 기능 제거
2. Moview Book 제거

# 학습 플로우

1. Reading(EB)
2. Act1 - PB는 바로 Act1 시작
3. Study
4. Result

# 컨테이너 구조
