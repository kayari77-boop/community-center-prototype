import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { useAppStore } from '../../core/store/appStore';
import { getApprovedMembers, getMyMembership } from '../../core/store/selectors';
import { ActiveMemberProvider } from '../context/ActiveMemberContext';
import RoleBadge from '../components/RoleBadge';
import EmptyState from '../components/EmptyState';

const TABS = [
  { to: 'board', label: '📋 게시판' },
  { to: 'events', label: '📅 일정' },
  { to: 'fees', label: '💰 회비' },
  { to: 'files', label: '📁 자료' },
  { to: 'chat', label: '💬 채팅' },
  { to: 'members', label: '👥 멤버' },
];

export default function ClubDetailLayout() {
  const { clubId } = useParams<{ clubId: string }>();
  const clubs = useAppStore((s) => s.clubs);
  const members = useAppStore((s) => s.members);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const activeMemberByClub = useAppStore((s) => s.activeMemberByClub);
  const setActiveMember = useAppStore((s) => s.setActiveMember);

  const club = clubs.find((c) => c.id === clubId);

  if (!club) {
    return (
      <div className="page">
        <EmptyState emoji="😵" text="존재하지 않는 동호회예요." />
      </div>
    );
  }

  const myMembership = getMyMembership(members, club.id, currentUserId);
  const approvedMembers = getApprovedMembers(members, club.id);
  const activeMemberId = activeMemberByClub[club.id] ?? myMembership?.id;
  const activeMember = approvedMembers.find((m) => m.id === activeMemberId) ?? myMembership;

  if (!myMembership || !activeMember) {
    return (
      <div className="page">
        <EmptyState emoji="🙅" text="이 동호회의 승인된 멤버가 아니에요." />
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/clubs" className="link-back">
        ← 동호회존
      </Link>

      <div className="card">
        <div className="row between wrap">
          <div>
            <div className="row wrap">
              <h1 style={{ marginBottom: 0 }}>{club.name}</h1>
              <span className="badge">{club.joinPolicy === 'instant' ? '즉시가입' : '승인제'}</span>
              {club.approvalStatus === 'pending' && <span className="badge pending">개설 승인 대기</span>}
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--ink-soft)' }}>{club.description}</p>
          </div>
        </div>

        {approvedMembers.length > 1 ? (
          <div className="row" style={{ marginTop: 14 }}>
            <label style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
              🕵️ 미리보기 (테스트용): 이 멤버 입장으로 보기
            </label>
            <select
              className="input"
              style={{ width: 'auto' }}
              value={activeMember.id}
              onChange={(e) => setActiveMember(club.id, e.target.value)}
            >
              {approvedMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role === 'president' ? '동호회장' : m.role === 'manager' ? '총무' : '회원'})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="row" style={{ marginTop: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>나:</span>
            <span>{activeMember.name}</span>
            <RoleBadge role={activeMember.role} />
          </div>
        )}
      </div>

      <div className="tabs" style={{ marginTop: 18 }}>
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <ActiveMemberProvider value={{ club, member: activeMember }}>
        <Outlet />
      </ActiveMemberProvider>
    </div>
  );
}
