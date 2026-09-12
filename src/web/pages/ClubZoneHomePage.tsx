import { Link } from 'react-router-dom';
import { useAppStore } from '../../core/store/appStore';
import { getMyMemberships } from '../../core/store/selectors';
import RoleBadge from '../components/RoleBadge';
import EmptyState from '../components/EmptyState';

export default function ClubZoneHomePage() {
  const clubs = useAppStore((s) => s.clubs);
  const members = useAppStore((s) => s.members);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const approveClub = useAppStore((s) => s.approveClub);

  const myMemberships = getMyMemberships(members, currentUserId);
  const myClubs = myMemberships
    .map((m) => ({ membership: m, club: clubs.find((c) => c.id === m.clubId) }))
    .filter((x) => x.club);

  const pendingClubs = clubs.filter((c) => c.approvalStatus === 'pending' && c.createdBy === currentUserId);

  return (
    <div className="page">
      <Link to="/" className="link-back">
        ← 지도로
      </Link>
      <div className="row between wrap">
        <h1>🎨 동호회존</h1>
        <Link to="/clubs/new" className="btn btn-primary">
          ➕ 동호회 만들기
        </Link>
      </div>

      {pendingClubs.length > 0 && (
        <div className="card" style={{ marginTop: 18, borderColor: 'var(--coral)' }}>
          <h3>🗂 개설 승인 대기함 (관리자용)</h3>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>
            실제 서비스에서는 운영진이 승인하지만, 이 프로토타입은 개발자 1인 사용 전제라 개설자 본인이
            승인해서 구조만 확인합니다.
          </p>
          <div className="stack">
            {pendingClubs.map((c) => (
              <div key={c.id} className="row between">
                <span>
                  <strong>{c.name}</strong>
                  <span className="badge pending" style={{ marginLeft: 8 }}>
                    승인 대기
                  </span>
                </span>
                <button className="btn btn-leaf btn-sm" onClick={() => approveClub(c.id)}>
                  ✅ 승인하기
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 18 }}>
        <h3>내 동호회</h3>
        {myClubs.length === 0 ? (
          <EmptyState emoji="🌱" text="아직 가입한 동호회가 없어요. 새로 만들어보세요!" />
        ) : (
          <div className="stack">
            {myClubs.map(({ club, membership }) => (
              <Link key={club!.id} to={`/clubs/${club!.id}`} className="card" style={{ display: 'block' }}>
                <div className="row between">
                  <div>
                    <div className="row">
                      <strong>{club!.name}</strong>
                      <RoleBadge role={membership.role} />
                      {club!.approvalStatus === 'pending' && <span className="badge pending">개설 승인 대기</span>}
                    </div>
                    <p style={{ margin: '6px 0 0', color: 'var(--ink-soft)', fontSize: 14 }}>{club!.description}</p>
                  </div>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
