# 구현 계획

- [x] 1. 프로젝트 초기 설정 및 구조 생성





  - Electron + React + TypeScript 프로젝트 보일러플레이트 생성
  - Vite 설정으로 React 개발 환경 구성
  - Electron Builder 설정 추가
  - 기본 폴더 구조 생성 (src/main, src/renderer, src/types)
  - _요구사항: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. TypeScript 인터페이스 및 타입 정의





  - VideoFile, PlaylistState, PlayerState, AppState 인터페이스 작성
  - AppAction 타입 정의 (모든 액션 타입)
  - IPC 채널 타입 정의
  - _요구사항: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3. Electron Main 프로세스 구현





  - [x] 3.1 기본 윈도우 생성 및 설정


    - BrowserWindow 생성 코드 작성
    - preload 스크립트 설정
    - Content Security Policy 설정
    - _요구사항: 6.1, 6.3_
  
  - [x] 3.2 파일 대화상자 IPC 핸들러 구현


    - open-file-dialog 핸들러 작성 (비디오 포맷 필터 포함)
    - open-folder-dialog 핸들러 작성
    - 폴더 스캔 및 비디오 파일 필터링 로직 구현
    - _요구사항: 2.1, 2.2, 3.1, 3.2, 3.3_
  
  - [x] 3.3 전체화면 토글 기능 구현

    - toggle-fullscreen IPC 핸들러 작성
    - 윈도우 전체화면 상태 관리
    - _요구사항: 5.7_

- [x] 4. React Context 및 상태 관리 구현




  - [x] 4.1 AppContext 및 Provider 생성


    - Context 생성 및 초기 상태 정의
    - useReducer로 상태 관리 로직 구현
    - _요구사항: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3_
  
  - [x] 4.2 Reducer 함수 구현


    - 모든 액션 타입에 대한 상태 변경 로직 작성
    - SET_PLAYLIST, SET_CURRENT_FILE, PLAY, PAUSE 등
    - NEXT_VIDEO, PREVIOUS_VIDEO 로직 (자동 재생 포함)
    - _요구사항: 4.1, 4.2, 4.3, 4.5, 5.1, 5.2_
  
  - [x] 4.3 로컬 스토리지 통합

    - 볼륨 설정 저장/로드 기능 구현
    - 앱 시작 시 저장된 설정 복원
    - _요구사항: 5.6_

- [x] 5. VideoPlayer 컴포넌트 구현





  - [x] 5.1 VideoDisplay 컴포넌트 작성


    - video 요소 생성 및 ref 관리
    - 현재 파일 변경 시 src 업데이트 로직
    - 비디오 이벤트 핸들러 (onEnded, onTimeUpdate, onLoadedMetadata)
    - 에러 처리 (MediaError 타입별 처리)
    - _요구사항: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.3, 2.4, 2.5, 4.3, 4.5_
  
  - [x] 5.2 VideoControls 컴포넌트 작성


    - PlayPauseButton 구현
    - ProgressBar 구현 (클릭으로 탐색 가능)
    - TimeDisplay 구현 (현재 시간/전체 시간)
    - VolumeControl 구현 (슬라이더)
    - FullscreenButton 구현
    - _요구사항: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_
  
  - [x] 5.3 키보드 단축키 구현


    - 스페이스바로 재생/일시정지
    - 화살표 키로 탐색 (좌우 5초)
    - f 키로 전체화면 토글
    - _요구사항: 6.2_

- [x] 6. Playlist 컴포넌트 구현




  - [x] 6.1 PlaylistHeader 컴포넌트 작성


    - 파일 개수 표시
    - 스타일링
    - _요구사항: 3.6_
  
  - [x] 6.2 PlaylistItem 컴포넌트 작성


    - 파일 이름 표시
    - 클릭 이벤트 핸들러 (파일 선택)
    - 현재 재생 중인 파일 하이라이트 표시
    - _요구사항: 3.5, 4.1, 4.2, 4.4_
  
  - [x] 6.3 Playlist 컨테이너 컴포넌트 작성


    - PlaylistItem 목록 렌더링
    - 스크롤 가능한 영역 구현
    - _요구사항: 3.5_

- [x] 7. 메뉴 및 레이아웃 구현




  - [x] 7.1 MenuBar 컴포넌트 작성


    - 파일 열기 버튼 (IPC 호출)
    - 폴더 열기 버튼 (IPC 호출)
    - _요구사항: 2.1, 3.1_
  
  - [x] 7.2 MainLayout 컴포넌트 작성


    - VideoPlayer와 Playlist를 포함하는 레이아웃
    - 반응형 레이아웃 (비디오 영역과 재생 목록 분리)
    - _요구사항: 6.1_
  
  - [x] 7.3 EmptyState 컴포넌트 작성


    - 파일이 없을 때 표시되는 안내 메시지
    - 파일/폴더 열기 안내
    - _요구사항: 6.3_

- [x] 8. IPC 통신 연결 및 통합





  - Renderer에서 Main으로 IPC 호출 구현
  - preload 스크립트에서 안전한 API 노출
  - 파일 선택 결과를 상태에 반영하는 로직
  - 에러 처리 및 사용자 피드백
  - _요구사항: 2.2, 2.3, 2.4, 2.5, 3.2, 3.3, 3.4_

- [x] 9. 스타일링 및 UI 개선





  - CSS Modules 또는 styled-components로 스타일 작성
  - 비디오 컨트롤 호버 효과
  - 재생 목록 항목 호버 및 선택 상태 스타일
  - 반응형 디자인 (다양한 윈도우 크기 지원)
  - 로딩 상태 표시
  - _요구사항: 6.1, 6.4_

- [ ] 10. 에러 처리 및 사용자 피드백





  - 지원하지 않는 포맷 에러 메시지 표시
  - 파일 로드 실패 처리
  - 재생 에러 시 다음 파일로 자동 건너뛰기
  - Toast 또는 알림 컴포넌트 구현
  - _요구사항: 2.5_

- [ ] 11. 테스트 작성

  - [-] 11.1 Reducer 단위 테스트


    - 모든 액션에 대한 상태 변경 테스트
    - _요구사항: 모든 요구사항_
  
  - [ ] 11.2 컴포넌트 테스트

    - React Testing Library로 주요 컴포넌트 테스트
    - VideoControls, Playlist 등
    - _요구사항: 모든 요구사항_
  
  - [ ] 11.3 IPC 통합 테스트

    - Main과 Renderer 프로세스 간 통신 테스트
    - _요구사항: 2.1, 2.2, 3.1, 3.2_

- [ ] 12. 빌드 및 패키징 설정

  - Electron Builder 설정 완성
  - Windows, macOS, Linux용 빌드 스크립트 작성
  - 아이콘 및 앱 메타데이터 설정
  - _요구사항: 모든 요구사항_
