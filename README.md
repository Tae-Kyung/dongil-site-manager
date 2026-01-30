# 동일유리 스마트 현장 관리 시스템

건설 현장 관리를 위한 통합 웹 애플리케이션입니다. 파편화된 현장 관리 데이터(네이버 밴드, 엑셀, ERP)를 단일 플랫폼으로 통합하고 AI 기반 인사이트를 제공합니다.

## 주요 기능

- **대시보드**: 전체 현장 현황 한눈에 파악
- **프로젝트 관리**: 프로젝트 생성/수정/삭제, 6단계 프로세스 타임라인
- **현장 로그**: 현장 사진 및 작업 일지 기록 (밴드 대체)
- **문서 관리**: 견적서, 계약서, 발주서 관리 (엑셀/ERP 대체)
- **AI 인사이트**: 리스크 감지 및 권장 사항 알림

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State**: Zustand
- **Deployment**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local` 파일을 생성하고 값을 입력합니다.

```bash
cp .env.local.example .env.local
```

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase 설정

**Step 1: 프로젝트 생성**
1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. Project Settings > API에서 URL과 anon key를 `.env.local`에 복사합니다.

**Step 2: 데이터베이스 스키마 생성**
1. SQL Editor에서 `supabase/setup.sql` 파일의 내용을 실행합니다.
2. (테이블, RLS 정책, 트리거, 기본 더미 데이터가 생성됩니다)

**Step 3: 테스트 계정 생성**
1. Authentication > Users에서 "Add user" 클릭
2. 다음 정보로 사용자 생성:
   ```
   Email: admin@dongil.com
   Password: admin123
   ```
3. (트리거가 자동으로 `users` 테이블에 레코드를 생성합니다)

**Step 4: 관리자 권한 부여 + 더미 데이터**
1. SQL Editor에서 `supabase/seed-data.sql` 파일의 내용을 실행합니다.
2. (사용자를 관리자로 설정하고 현장 로그 샘플 데이터가 추가됩니다)

**Step 5: Storage 설정 (선택)**
1. Storage에서 `site-images` 버킷을 생성합니다 (public 체크)

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다.

### 5. 로그인

```
Email: admin@dongil.com
Password: admin123
```

## 프로젝트 구조

```
dongil-site-manager/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # 인증 페이지 (로그인)
│   ├── (dashboard)/            # 대시보드 페이지
│   │   ├── page.tsx            # 메인 대시보드
│   │   ├── projects/           # 프로젝트 관리
│   │   ├── schedule/           # 일정 관리
│   │   ├── teams/              # 팀 관리
│   │   └── settings/           # 설정
│   ├── api/                    # API 라우트
│   └── layout.tsx              # 루트 레이아웃
├── components/
│   ├── ui/                     # shadcn/ui 컴포넌트
│   ├── layout/                 # 레이아웃 (Sidebar, Header)
│   ├── common/                 # 공통 컴포넌트
│   ├── projects/               # 프로젝트 관련 컴포넌트
│   └── auth/                   # 인증 컴포넌트
├── hooks/                      # 커스텀 훅
├── lib/                        # 유틸리티, Supabase 클라이언트
├── store/                      # Zustand 스토어
├── types/                      # TypeScript 타입
├── supabase/
│   └── setup.sql               # DB 스키마 + 더미 데이터
├── PRD.md                      # 제품 요구사항 문서
└── TASK.md                     # 개발 태스크 목록
```

## 데이터베이스 스키마

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 (Supabase Auth 연동) |
| `teams` | 시공팀 |
| `projects` | 프로젝트/현장 |
| `project_members` | 프로젝트 참여자 |
| `site_logs` | 현장 로그 |
| `documents` | 문서 (견적서, 발주서 등) |
| `ai_insights` | AI 분석 결과 |
| `schedules` | 일정 |

## 프로세스 단계

1. **현장방문** (visit)
2. **견적** (estimate)
3. **시공팀 배정** (assign)
4. **발주** (order)
5. **시공** (install)
6. **정산** (settle)

## Vercel 배포

1. [Vercel](https://vercel.com)에서 GitHub 저장소를 연결합니다.
2. 환경 변수를 설정합니다.
3. 배포합니다.

```bash
# 또는 CLI로 배포
npx vercel
```

## 개발 가이드

### 컴포넌트 추가

shadcn/ui 컴포넌트 추가:

```bash
npx shadcn@latest add [component-name]
```

### 타입 생성

Supabase 타입 자동 생성:

```bash
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

## 라이선스

Private - 동일유리 내부용

---

**버전**: 1.0.0
