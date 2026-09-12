// ============================================================================
// 권한 체크 로직 (core)
//
// 웹/모바일 어느 UI에서든 "이 역할이 이 동작을 할 수 있는가"를 동일하게
// 판단하기 위한 순수 함수 모음. 실제 서버가 생기기 전까지는 UI 레이어에서
// 이 함수들로 버튼 노출/비활성 여부를 결정한다.
//
// 스펙 3.2: 동호회장(전체 관리) / 총무(회비·자료 등 운영 보조) / 회원(일반 참여)
// ============================================================================

import { Role } from './types';

/** 동호회 정보 수정, 삭제, 개설 승인 등 전체 관리 */
export const canManageClub = (role: Role): boolean => role === 'president';

/** 회원 역할 변경, 강퇴 등 회원 관리 */
export const canManageMembers = (role: Role): boolean => role === 'president';

/** 가입 신청 승인/거절 (총무도 운영 보조로 가능) */
export const canApproveJoin = (role: Role): boolean => role === 'president' || role === 'manager';

/** 회비 기록 추가/수정/삭제 */
export const canManageFees = (role: Role): boolean => role === 'president' || role === 'manager';

/** 공지글 작성 (일반 자유글과 달리 공지는 운영진만) */
export const canPostNotice = (role: Role): boolean => role === 'president' || role === 'manager';

/** 자유글 작성은 회원 누구나 가능 */
export const canWritePost = (_role: Role): boolean => true;

/** 게시글 삭제: 작성자 본인 또는 운영진 */
export const canDeletePost = (role: Role, isAuthor: boolean): boolean =>
  isAuthor || role === 'president' || role === 'manager';

/** 자료 업로드는 회원 누구나 가능 */
export const canUploadFile = (_role: Role): boolean => true;

/** 자료 삭제: 업로더 본인 또는 운영진 */
export const canDeleteFile = (role: Role, isUploader: boolean): boolean =>
  isUploader || role === 'president' || role === 'manager';

/** 역할 한글 표시명 */
export const roleLabel: Record<Role, string> = {
  president: '동호회장',
  manager: '총무',
  member: '회원',
};
