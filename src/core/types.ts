// ============================================================================
// 도메인 타입 정의 (core)
//
// 이 파일은 플랫폼(웹 / React Native)에 상관없이 그대로 재사용되는
// "동호회존" 데이터 모델입니다. UI나 저장 방식이 바뀌어도 이 타입들은
// 그대로 가져다 쓸 수 있도록, 렌더링/스토리지 관련 내용을 섞지 않습니다.
// ============================================================================

/** 동호회 내 역할 3단계: 동호회장 / 총무 / 회원 */
export type Role = 'president' | 'manager' | 'member';

/** 동호회 가입 방식: 즉시가입 / 승인제 */
export type JoinPolicy = 'instant' | 'approval';

/** 승인 상태 (동호회 개설 승인, 회원 가입 승인 등에 공용으로 사용) */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

/** 동호회 */
export interface Club {
  id: string;
  name: string;
  description: string;
  joinPolicy: JoinPolicy;
  /** 관리자(운영진)의 "동호회 개설" 승인 상태. 실제 서비스에서는 별도 관리자가 승인하지만,
   *  이 프로토타입은 개발자 1인 사용 전제라 개설자 본인이 승인 버튼을 눌러 구조만 확인한다. */
  approvalStatus: ApprovalStatus;
  createdAt: string;
  /** 개설자의 device user id (core/store 의 currentUserId) */
  createdBy: string;
}

/** 동호회 회원 (특정 동호회에 대한 소속 정보) */
export interface Member {
  id: string;
  clubId: string;
  /** 실제 인증 붙기 전까지는 device user id 또는 테스트용으로 생성된 임의 id */
  userId: string;
  name: string;
  role: Role;
  /** 가입 승인 상태. joinPolicy 가 'approval' 인 동호회는 pending 으로 시작할 수 있음 */
  status: ApprovalStatus;
  joinedAt: string;
}

/** 공지(모임) 글에 대한 참석 체크 1건 */
export interface AttendanceRecord {
  memberId: string;
  status: 'yes' | 'no';
  respondedAt: string;
}

/** 모임 공지에 담기는 상세 정보. 별도 Event 엔티티 대신 Post 에 얹어서
 *  "공지 하나에 모임에 필요한 정보를 모두 담는다"는 스펙 요구를 그대로 반영한다. */
export interface EventDetails {
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  location?: string;
  itemsToBring?: string;
  feeInfo?: string;
  attendance: AttendanceRecord[];
}

/** 게시글 (공지사항 / 자유글 공용) */
export interface Post {
  id: string;
  clubId: string;
  /** 작성자의 Member id */
  authorId: string;
  title: string;
  content: string;
  /** 공지 여부. true 인 경우에만 event 가 존재할 수 있음 */
  isNotice: boolean;
  event?: EventDetails;
  createdAt: string;
  updatedAt: string;
}

/** 회비 기록 (수기 입력 장부 1건) */
export interface FeeRecord {
  id: string;
  clubId: string;
  memberId: string;
  amount: number;
  paid: boolean;
  date: string; // YYYY-MM-DD
  memo?: string;
  /** 기록을 입력한 Member id (보통 총무/회장) */
  recordedBy: string;
  createdAt: string;
}

/** 자료(파일) 메타데이터. 실제 파일 바이트는 core 밖(플랫폼별 BlobStorageAdapter)에 저장된다. */
export interface FileRecord {
  id: string;
  clubId: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploaderId: string;
  uploadedAt: string;
  /** BlobStorageAdapter 에서 실제 바이트를 조회하기 위한 키 */
  blobKey: string;
}

/** 채팅 메시지 (보조 기능, 단순 버전) */
export interface ChatMessage {
  id: string;
  clubId: string;
  authorId: string;
  text: string;
  createdAt: string;
}
