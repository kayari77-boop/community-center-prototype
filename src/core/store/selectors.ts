// ============================================================================
// 셀렉터 (core)
//
// zustand state의 배열들을 화면에서 쓰기 좋은 형태로 걸러주는 순수 함수들.
// 웹 컴포넌트와 (나중의) React Native 컴포넌트가 동일하게 가져다 쓴다.
// ============================================================================

import { ChatMessage, Club, FeeRecord, FileRecord, Member, Post } from '../types';

export const getClubById = (clubs: Club[], clubId: string): Club | undefined =>
  clubs.find((c) => c.id === clubId);

export const getApprovedMembers = (members: Member[], clubId: string): Member[] =>
  members
    .filter((m) => m.clubId === clubId && m.status === 'approved')
    .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));

export const getPendingMembers = (members: Member[], clubId: string): Member[] =>
  members.filter((m) => m.clubId === clubId && m.status === 'pending');

export const getRejectedMembers = (members: Member[], clubId: string): Member[] =>
  members.filter((m) => m.clubId === clubId && m.status === 'rejected');

export const getMyMemberships = (members: Member[], userId: string): Member[] =>
  members.filter((m) => m.userId === userId && m.status === 'approved');

export const getMyMembership = (members: Member[], clubId: string, userId: string): Member | undefined =>
  members.find((m) => m.clubId === clubId && m.userId === userId && m.status === 'approved');

export const getClubPosts = (posts: Post[], clubId: string): Post[] =>
  posts.filter((p) => p.clubId === clubId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const getPost = (posts: Post[], postId: string): Post | undefined =>
  posts.find((p) => p.id === postId);

export const getClubEventPosts = (posts: Post[], clubId: string): Post[] =>
  getClubPosts(posts, clubId).filter((p) => !!p.event);

export const getClubFees = (records: FeeRecord[], clubId: string): FeeRecord[] =>
  records.filter((r) => r.clubId === clubId).sort((a, b) => b.date.localeCompare(a.date));

export const getClubFiles = (files: FileRecord[], clubId: string): FileRecord[] =>
  files.filter((f) => f.clubId === clubId).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

export const getClubChat = (messages: ChatMessage[], clubId: string): ChatMessage[] =>
  messages.filter((m) => m.clubId === clubId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export const findMemberName = (members: Member[], memberId: string | undefined): string =>
  (memberId && members.find((m) => m.id === memberId)?.name) || '(알 수 없음)';

export const findMember = (members: Member[], memberId: string | undefined): Member | undefined =>
  members.find((m) => m.id === memberId);
