// ============================================================================
// 앱 상태 / 비즈니스 로직 (core)
//
// 동호회존의 모든 데이터와 "동작"(동호회 생성, 가입 승인, 글쓰기, 참석체크,
// 회비 기록, 채팅 등)이 이 스토어 하나에 모여 있다. 컴포넌트는 이 store의
// 훅과 액션만 호출하면 되고, 저장 방식(localStorage → AsyncStorage 등)이나
// 화면(웹 → React Native)이 바뀌어도 이 파일은 거의 그대로 재사용된다.
//
// ── React Native로 옮길 때 바꿔야 하는 부분은 딱 하나, 아래 persist의
//    `storage` 옵션이다. (createJSONStorage(() => AsyncStorage) 등으로 교체)
// ============================================================================

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  ApprovalStatus,
  ChatMessage,
  Club,
  EventDetails,
  FeeRecord,
  FileRecord,
  JoinPolicy,
  Member,
  Post,
  Role,
} from '../types';
import { generateId, nowISO, todayYMD } from '../utils';

interface AppState {
  // ---- 데이터 ----
  currentUserId: string;
  currentUserName: string;
  clubs: Club[];
  members: Member[];
  posts: Post[];
  feeRecords: FeeRecord[];
  files: FileRecord[];
  chatMessages: ChatMessage[];
  /** 프로토타입 전용: 동호회별로 "지금 이 화면에서 누구 입장으로 행동할지".
   *  실제 서비스에는 없는 개발/QA 도구이며, 역할별 권한 UI를 미리 확인하기 위함. */
  activeMemberByClub: Record<string, string>;
  seeded: boolean;

  // ---- 사용자 ----
  setCurrentUserName: (name: string) => void;

  // ---- 동호회 ----
  createClub: (input: { name: string; description: string; joinPolicy: JoinPolicy }) => {
    clubId: string;
    memberId: string;
  };
  approveClub: (clubId: string) => void;

  // ---- 멤버 / 가입 ----
  addInstantMember: (clubId: string, name: string, role: Role) => string;
  requestJoin: (clubId: string, name: string) => string;
  approveMember: (memberId: string) => void;
  rejectMember: (memberId: string) => void;
  setMemberRole: (memberId: string, role: Role) => void;
  removeMember: (memberId: string) => void;
  setActiveMember: (clubId: string, memberId: string) => void;

  // ---- 게시판 / 일정 ----
  createPost: (input: {
    clubId: string;
    authorId: string;
    title: string;
    content: string;
    isNotice: boolean;
    event?: Omit<EventDetails, 'attendance'>;
  }) => string;
  updatePost: (
    postId: string,
    patch: Partial<Pick<Post, 'title' | 'content' | 'isNotice'>> & {
      event?: Omit<EventDetails, 'attendance'> | null;
    },
  ) => void;
  deletePost: (postId: string) => void;
  setAttendance: (postId: string, memberId: string, status: 'yes' | 'no') => void;

  // ---- 회비 ----
  addFeeRecord: (input: Omit<FeeRecord, 'id' | 'createdAt'>) => string;
  updateFeeRecord: (id: string, patch: Partial<Omit<FeeRecord, 'id' | 'clubId'>>) => void;
  deleteFeeRecord: (id: string) => void;

  // ---- 자료 ----
  addFileRecord: (input: Omit<FileRecord, 'id' | 'uploadedAt'>) => string;
  deleteFileRecord: (id: string) => void;

  // ---- 채팅 ----
  sendChatMessage: (clubId: string, authorId: string, text: string) => void;

  // ---- 데모 데이터 ----
  seedDemoData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: generateId(),
      currentUserName: '나',
      clubs: [],
      members: [],
      posts: [],
      feeRecords: [],
      files: [],
      chatMessages: [],
      activeMemberByClub: {},
      seeded: false,

      setCurrentUserName: (name) => set({ currentUserName: name }),

      createClub: ({ name, description, joinPolicy }) => {
        const clubId = generateId();
        const memberId = generateId();
        const { currentUserId, currentUserName } = get();

        const club: Club = {
          id: clubId,
          name,
          description,
          joinPolicy,
          approvalStatus: 'pending', // 관리자 승인제 구조 반영 (프로토타입에서는 본인이 승인)
          createdAt: nowISO(),
          createdBy: currentUserId,
        };
        const founder: Member = {
          id: memberId,
          clubId,
          userId: currentUserId,
          name: currentUserName,
          role: 'president',
          status: 'approved',
          joinedAt: nowISO(),
        };

        set((s) => ({ clubs: [...s.clubs, club], members: [...s.members, founder] }));
        return { clubId, memberId };
      },

      approveClub: (clubId) =>
        set((s) => ({
          clubs: s.clubs.map((c) => (c.id === clubId ? { ...c, approvalStatus: 'approved' as ApprovalStatus } : c)),
        })),

      addInstantMember: (clubId, name, role) => {
        const memberId = generateId();
        const member: Member = {
          id: memberId,
          clubId,
          userId: generateId(),
          name,
          role,
          status: 'approved',
          joinedAt: nowISO(),
        };
        set((s) => ({ members: [...s.members, member] }));
        return memberId;
      },

      requestJoin: (clubId, name) => {
        const club = get().clubs.find((c) => c.id === clubId);
        const memberId = generateId();
        const member: Member = {
          id: memberId,
          clubId,
          userId: generateId(),
          name,
          role: 'member',
          status: club?.joinPolicy === 'instant' ? 'approved' : 'pending',
          joinedAt: nowISO(),
        };
        set((s) => ({ members: [...s.members, member] }));
        return memberId;
      },

      approveMember: (memberId) =>
        set((s) => ({
          members: s.members.map((m) => (m.id === memberId ? { ...m, status: 'approved' as ApprovalStatus } : m)),
        })),

      rejectMember: (memberId) =>
        set((s) => ({
          members: s.members.map((m) => (m.id === memberId ? { ...m, status: 'rejected' as ApprovalStatus } : m)),
        })),

      setMemberRole: (memberId, role) =>
        set((s) => ({ members: s.members.map((m) => (m.id === memberId ? { ...m, role } : m)) })),

      removeMember: (memberId) =>
        set((s) => ({ members: s.members.filter((m) => m.id !== memberId) })),

      setActiveMember: (clubId, memberId) =>
        set((s) => ({ activeMemberByClub: { ...s.activeMemberByClub, [clubId]: memberId } })),

      createPost: ({ clubId, authorId, title, content, isNotice, event }) => {
        const postId = generateId();
        const ts = nowISO();
        const post: Post = {
          id: postId,
          clubId,
          authorId,
          title,
          content,
          isNotice,
          event: isNotice && event ? { ...event, attendance: [] } : undefined,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ posts: [...s.posts, post] }));
        return postId;
      },

      updatePost: (postId, patch) =>
        set((s) => ({
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            const next: Post = { ...p, updatedAt: nowISO() };
            if (patch.title !== undefined) next.title = patch.title;
            if (patch.content !== undefined) next.content = patch.content;
            if (patch.isNotice !== undefined) next.isNotice = patch.isNotice;
            if (patch.event === null) {
              next.event = undefined;
            } else if (patch.event) {
              next.event = { ...patch.event, attendance: p.event?.attendance ?? [] };
            }
            if (next.isNotice === false) next.event = undefined;
            return next;
          }),
        })),

      deletePost: (postId) => set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) })),

      setAttendance: (postId, memberId, status) =>
        set((s) => ({
          posts: s.posts.map((p) => {
            if (p.id !== postId || !p.event) return p;
            const rest = p.event.attendance.filter((a) => a.memberId !== memberId);
            return {
              ...p,
              event: {
                ...p.event,
                attendance: [...rest, { memberId, status, respondedAt: nowISO() }],
              },
            };
          }),
        })),

      addFeeRecord: (input) => {
        const id = generateId();
        const record: FeeRecord = { ...input, id, createdAt: nowISO() };
        set((s) => ({ feeRecords: [...s.feeRecords, record] }));
        return id;
      },

      updateFeeRecord: (id, patch) =>
        set((s) => ({ feeRecords: s.feeRecords.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

      deleteFeeRecord: (id) => set((s) => ({ feeRecords: s.feeRecords.filter((r) => r.id !== id) })),

      addFileRecord: (input) => {
        const id = generateId();
        const record: FileRecord = { ...input, id, uploadedAt: nowISO() };
        set((s) => ({ files: [...s.files, record] }));
        return id;
      },

      deleteFileRecord: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),

      sendChatMessage: (clubId, authorId, text) => {
        const message: ChatMessage = { id: generateId(), clubId, authorId, text, createdAt: nowISO() };
        set((s) => ({ chatMessages: [...s.chatMessages, message] }));
      },

      seedDemoData: () => {
        if (get().seeded) return;
        const { currentUserId, currentUserName } = get();
        const clubId = generateId();
        const founderId = generateId();
        const managerId = generateId();
        const memberId = generateId();
        const postId = generateId();
        const freePostId = generateId();
        const ts = nowISO();

        const club: Club = {
          id: clubId,
          name: '주말 등산 동호회',
          description: '매달 둘째 주 토요일, 근교 산으로 함께 갑니다. 초보자도 환영해요 🏔️',
          joinPolicy: 'approval',
          approvalStatus: 'approved',
          createdAt: ts,
          createdBy: currentUserId,
        };
        const founder: Member = {
          id: founderId,
          clubId,
          userId: currentUserId,
          name: currentUserName,
          role: 'president',
          status: 'approved',
          joinedAt: ts,
        };
        const manager: Member = {
          id: managerId,
          clubId,
          userId: generateId(),
          name: '김총무',
          role: 'manager',
          status: 'approved',
          joinedAt: ts,
        };
        const member: Member = {
          id: memberId,
          clubId,
          userId: generateId(),
          name: '이회원',
          role: 'member',
          status: 'approved',
          joinedAt: ts,
        };
        const eventPost: Post = {
          id: postId,
          clubId,
          authorId: founderId,
          title: '9월 정기 산행 안내 🎒',
          content: '이번 달은 관악산입니다. 등산화 꼭 챙겨주세요! 하산 후 간단히 식사도 함께해요.',
          isNotice: true,
          event: {
            date: todayYMD(),
            time: '09:00',
            location: '관악산 입구 (사당역 4번 출구)',
            itemsToBring: '등산화, 물, 간식',
            feeInfo: '회비 5,000원 (식사비 포함)',
            attendance: [{ memberId: managerId, status: 'yes', respondedAt: ts }],
          },
          createdAt: ts,
          updatedAt: ts,
        };
        const freePost: Post = {
          id: freePostId,
          clubId,
          authorId: memberId,
          title: '다들 등산화 어디서 사세요?',
          content: '이번에 새로 하나 장만하려는데 추천 부탁드려요!',
          isNotice: false,
          createdAt: ts,
          updatedAt: ts,
        };
        const feeRecord: FeeRecord = {
          id: generateId(),
          clubId,
          memberId: managerId,
          amount: 5000,
          paid: true,
          date: todayYMD(),
          memo: '9월 산행 회비',
          recordedBy: founderId,
          createdAt: ts,
        };

        set((s) => ({
          clubs: [...s.clubs, club],
          members: [...s.members, founder, manager, member],
          posts: [...s.posts, eventPost, freePost],
          feeRecords: [...s.feeRecords, feeRecord],
          seeded: true,
        }));
      },
    }),
    {
      name: 'club-zone-storage',
      // 웹: localStorage. React Native로 옮길 때는 아래 한 줄만
      // createJSONStorage(() => AsyncStorage) 로 교체하면 store 로직은 그대로 재사용된다.
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
