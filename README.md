# 본부 커뮤니티 센터 — 동호회존 프로토타입

`동호회존_프로토타입_스펙.md`의 1차 검증용 웹 프로토타입입니다.

- 저장소: https://github.com/kayari77-boop/community-center-prototype

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속. 별도 로그인 없이 바로 사용할 수 있습니다
(우측 상단에서 내 이름만 바꿀 수 있어요). 데이터는 브라우저(localStorage / IndexedDB)에
영구 저장되어 새로고침/재시작해도 유지됩니다.

## 기술 스택

- **React + TypeScript + Vite** — 빠른 개발 환경
- **react-router-dom** — 화면 라우팅 (웹 전용)
- **zustand** (+ `persist` 미들웨어) — 상태관리 & 영구 저장
- 파일(자료) 바이트는 **IndexedDB**에 저장 (localStorage 용량 제약 회피)

## 왜 이 구조인가 — 모바일(React Native) 재사용을 위한 설계

폴더를 두 축으로 나눴습니다.

```
src/
  core/            ← 플랫폼과 무관한 "두뇌" 부분. 나중에 React Native 앱에서도 그대로 가져다 쓴다.
    types.ts         도메인 타입 (Club, Member, Post, FeeRecord, FileRecord, ChatMessage ...)
    permissions.ts   역할(동호회장/총무/회원) 기반 권한 체크 순수 함수
    utils.ts         id 생성, 날짜/금액 포맷 등
    adapters/types.ts  BlobStorageAdapter 인터페이스 (파일 바이트 저장을 추상화)
    store/
      appStore.ts    zustand 스토어 — 모든 데이터 + "동작"(생성/승인/CRUD 등) 이 여기 모여있음
      selectors.ts   화면에서 자주 쓰는 필터/조회 함수

  platform/
    web/
      blobStorage.ts   BlobStorageAdapter의 웹 구현체 (IndexedDB)
      (RN으로 옮길 때 이 폴더 옆에 platform/native/blobStorage.ts 를 만들어
       expo-file-system 등으로 구현하면 된다)

  web/             ← 웹 전용 UI. React Native로 갈 때 이 폴더만 새로 짜면 된다.
    pages/, components/, context/, styles/
```

**핵심 아이디어**: 화면(컴포넌트)은 얇게, `core/store`는 "무엇을 할 수 있는가"를 전부 알고
있게 만들었습니다. 예를 들어 "동호회 생성", "가입 승인", "참석 체크", "회비 기록 추가" 같은
로직은 모두 `core/store/appStore.ts`의 액션 함수 하나로 존재하고, 웹 컴포넌트는 그 함수를
호출만 합니다.

React Native로 포팅할 때 실제로 손댈 부분은:

1. `src/web/**` 대신 RN 컴포넌트(화면)를 새로 그린다 — 이때도 `core/store`, `core/permissions`,
   `core/store/selectors`는 import만 하면 그대로 동작한다.
2. `appStore.ts`의 persist `storage` 옵션을 `createJSONStorage(() => AsyncStorage)`로 교체한다
   (딱 한 줄).
3. `BlobStorageAdapter`의 RN 구현체(`platform/native/blobStorage.ts`)를 `expo-file-system` 등으로
   새로 만든다. `core`나 다른 컴포넌트 코드는 건들 필요 없다.
4. `react-router-dom` 대신 `react-navigation`으로 라우팅을 다시 짠다 (역할 자체는 웹의
   페이지 구조와 1:1로 대응되도록 이름을 맞춰놨습니다: 게시판/일정/회비/자료/채팅/멤버).

## 스펙 반영 메모

- **역할 구조(3.2)**: `core/types.ts`의 `Role`, `core/permissions.ts`에 전부 구현. 실제 테스트는
  동호회장 기준으로 하되, 동호회 상세 화면에서 "미리보기 (테스트용)" 멤버 선택 드롭다운으로
  총무/회원 시점의 권한 UI도 바로 확인할 수 있습니다.
- **개설 승인제(3.1)**: 동호회 생성 시 `approvalStatus: 'pending'`으로 시작 → 동호회존 홈의
  "개설 승인 대기함"에서 승인. 개발자 1인 사용 전제라 승인자=개설자이지만, 구조(상태값, 승인 액션)는
  실제 서비스와 동일하게 분리되어 있습니다.
- **가입 방식(3.3)**: 동호회 생성 시 즉시가입/승인제 선택. 멤버 탭의 "테스트 도구"에서 가상의
  가입 신청자를 만들어 두 방식의 흐름을 모두 확인할 수 있습니다.
- **공지에 모임 정보 포함(3.5)**: 별도 Event 테이블을 만들지 않고, `Post.event`에 날짜/시간/장소/
  준비물/회비 정보 + 참석체크 목록을 함께 담았습니다 (스펙 문구를 그대로 데이터 모델에 반영).
- **회비(3.6)**: 결제 연동 없이 수기 기록/조회만 구현. 총무/동호회장만 기록 추가·수정·삭제 가능.
- **자료(3.7)**: 업로드/다운로드/삭제, 업로더 본인 또는 운영진만 삭제 가능.
- **채팅(3.4)**: 보조 기능으로 단순한 로컬 메시지 로그만 구현 (실시간 서버 없음).
