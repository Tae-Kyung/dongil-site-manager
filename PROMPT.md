# CEO's Email
"
교수님 보내주신 자료 확인해보았습니다.
이런 식으로 각 공사현장의 관리를 체계화되게 진행할수도 있겠다는 생각이 듭니다.
예를 들면 A현장에 대한 진행데이터를 첫현장방문부터 견적참여, 시공팀배정, 발주, 정산 등 각 과정에 여러 직원들이 함께 참여하게 되는데 지금은 네이버밴드, 엑셀, ERP 등 여러 자료들을 살펴야하는 상황이거든요..
교수님 보내주신 프로그램을 보며 작은 희망의 불씨가 켜지는 것 같습니다.
내일 뵙겠습니다.
"

# Project Goal
'동일유리(Dongil Glass)' 임직원 교육을 위해, 파편화된 현장 관리(네이버 밴드, 엑셀, ERP)를 통합하고 AI 인사이트를 제공하는 '스마트 현장 대시보드' 웹 애플리케이션을 구현해줘.

# Tech Stack & Constraints (Auto-Selection)
1. Framework: Vercel 배포에 가장 최적화되고, Supabase와 연동이 쉬운 '최신 모던 웹 프레임워크'를 네가 선택해서 사용해. (React/Next.js 권장)
2. Styling: Tailwind CSS를 사용하여 비즈니스급 UI를 빠르게 구축해.
3. Database: Supabase를 사용. (실제 연동을 위한 코드와 SQL 스크립트 작성 필요)
4. Deployment: Vercel을 통한 배포를 전제로 구조를 잡아줘.

# Database Schema (Supabase)
다음 테이블 구조를 가정하고 코드를 작성해. (그리고 내가 Supabase SQL Editor에 붙여넣을 수 있는 `setup.sql` 파일을 만들어줘):
1. `projects`: id, name, location, status (진행중, 완료 등), process_step (현장방문/견적/배정/발주/정산), start_date
2. `site_logs` (밴드 대체): id, project_id, image_url, content, author, created_at
3. `documents` (엑셀/ERP 대체): id, project_id, type (견적서/발주서), amount, file_name, status
4. `ai_insights`: id, project_id, message (AI 분석 내용), risk_level (Normal/Warning/Critical)

# Key Features & UI Layout
1. **Sidebar Navigation**: 등록된 프로젝트 리스트 표시.
2. **Project Detail View (Main Page)**:
   - **Top**: '프로세스 타임라인' (현장방문 -> ... -> 정산) 시각화. 현재 단계 Highlight.
   - **Body (3-Column Grid)**:
     - [Left - 현장]: 현장 사진과 작업 로그 피드 (SNS 스타일).
     - [Center - 관리]: 견적 금액, 발주 현황, 문서 리스트 (테이블 스타일).
     - [Right - AI 비서]: "⚠️ 자재 납기 지연 리스크 감지됨" 같은 AI 분석 메시지 카드.

# Deliverables
1. `setup.sql`: Supabase 테이블 생성 및 초기 더미 데이터(청주 오송 2공장 예시 포함) 입력용 SQL.
2. `env.local.example`: Supabase URL 및 Key 설정 파일 예시.
3. 전체 웹 애플리케이션 소스 코드.
4. `README.md`: 로컬 실행 및 Vercel 배포 방법 가이드.

# Mock Data Requirement
`setup.sql`에 '청주 오송 2공장' 데이터를 반드시 포함해줘.
- 현장 사진: Unsplash 건설 관련 랜덤 이미지 URL 사용.
- 견적: 1억 5천만원.
- 상태: '발주' 단계.
- AI 인사이트: "최근 강우로 인해 외부 실리콘 작업 지연이 예상됩니다." 라는 내용 포함.

지금 바로 프레임워크를 선택하고 프로젝트를 생성해줘.