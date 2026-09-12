// 동호회 상세 화면 하위(게시판/일정/회비/자료/채팅) 모두에서
// "지금 나는 어떤 멤버로 행동하고 있는가"를 공유하기 위한 컨텍스트.
// React Context는 React Native에서도 그대로 동작하므로 이 패턴은 재사용 가능하다.

import { createContext, useContext } from 'react';
import { Club, Member } from '../../core/types';

export interface ActiveMemberContextValue {
  club: Club;
  member: Member;
}

const ActiveMemberContext = createContext<ActiveMemberContextValue | null>(null);

export const ActiveMemberProvider = ActiveMemberContext.Provider;

export function useActiveMember(): ActiveMemberContextValue {
  const ctx = useContext(ActiveMemberContext);
  if (!ctx) throw new Error('useActiveMember must be used within ClubDetailLayout');
  return ctx;
}
