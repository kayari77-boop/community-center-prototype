import { Link } from 'react-router-dom';
import { useAppStore } from '../../core/store/appStore';
import { getClubEventPosts } from '../../core/store/selectors';
import { useActiveMember } from '../context/ActiveMemberContext';
import EmptyState from '../components/EmptyState';

// 별도 Event 엔티티 대신, event 정보가 달린 공지 글들을 모아 보여주는 필터 뷰.
// (스펙 3.5: "공지 하나에 모임에 필요한 정보를 모두 담는다")
export default function EventsTab() {
  const { club, member } = useActiveMember();
  const posts = useAppStore((s) => s.posts);

  const events = getClubEventPosts(posts, club.id).sort((a, b) => a.event!.date.localeCompare(b.event!.date));

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>📅 모임 일정</h3>
      {events.length === 0 ? (
        <EmptyState emoji="🗓️" text="등록된 모임 일정이 없어요. 게시판에서 공지를 작성해보세요." />
      ) : (
        <div className="stack">
          {events.map((p) => {
            const my = p.event!.attendance.find((a) => a.memberId === member.id)?.status;
            const yesCount = p.event!.attendance.filter((a) => a.status === 'yes').length;
            return (
              <Link key={p.id} to={`/clubs/${club.id}/board/${p.id}`} className="card" style={{ display: 'block' }}>
                <div className="row between wrap">
                  <div>
                    <strong>{p.title}</strong>
                    <div className="meta">
                      📅 {p.event!.date} {p.event!.time ?? ''} {p.event!.location ? `· 📍 ${p.event!.location}` : ''}
                    </div>
                  </div>
                  <div className="row">
                    <span className="badge">참석 {yesCount}명</span>
                    <span className="badge">{my === 'yes' ? '✅ 참석함' : my === 'no' ? '❌ 불참함' : '⏳ 미응답'}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
