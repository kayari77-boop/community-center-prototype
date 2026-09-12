import { Link } from 'react-router-dom';
import { useAppStore } from '../../core/store/appStore';
import { getClubPosts, findMemberName } from '../../core/store/selectors';
import { formatDateTime } from '../../core/utils';
import { useActiveMember } from '../context/ActiveMemberContext';
import EmptyState from '../components/EmptyState';

export default function BoardTab() {
  const { club } = useActiveMember();
  const posts = useAppStore((s) => s.posts);
  const members = useAppStore((s) => s.members);

  const clubPosts = getClubPosts(posts, club.id);

  return (
    <div className="card">
      <div className="row between">
        <h3 style={{ margin: 0 }}>📋 게시판</h3>
        <Link to="new" className="btn btn-primary btn-sm">
          ✏️ 글쓰기
        </Link>
      </div>

      {clubPosts.length === 0 ? (
        <EmptyState emoji="📭" text="아직 올라온 글이 없어요." />
      ) : (
        <div style={{ marginTop: 8 }}>
          {clubPosts.map((p) => (
            <Link key={p.id} to={p.id} className="post-item" style={{ display: 'block' }}>
              <div className="title">
                {p.isNotice && '📌 '}
                {p.title}
                {p.event && ' 🎒'}
              </div>
              <div className="meta">
                {findMemberName(members, p.authorId)} · {formatDateTime(p.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
