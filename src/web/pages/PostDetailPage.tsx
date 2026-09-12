import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../core/store/appStore';
import { findMemberName, getApprovedMembers } from '../../core/store/selectors';
import { canDeletePost } from '../../core/permissions';
import { formatDateTime } from '../../core/utils';
import { useActiveMember } from '../context/ActiveMemberContext';
import EmptyState from '../components/EmptyState';

export default function PostDetailPage() {
  const { club, member } = useActiveMember();
  const { postId } = useParams<{ postId: string }>();
  const posts = useAppStore((s) => s.posts);
  const members = useAppStore((s) => s.members);
  const deletePost = useAppStore((s) => s.deletePost);
  const setAttendance = useAppStore((s) => s.setAttendance);
  const navigate = useNavigate();

  const post = posts.find((p) => p.id === postId);
  if (!post) {
    return <div className="card"><EmptyState emoji="😵" text="글을 찾을 수 없어요." /></div>;
  }

  const isAuthor = post.authorId === member.id;
  const canDelete = canDeletePost(member.role, isAuthor);
  const approvedMembers = getApprovedMembers(members, club.id);
  const myAttendance = post.event?.attendance.find((a) => a.memberId === member.id)?.status;

  const onDelete = () => {
    if (!confirm('이 글을 삭제할까요?')) return;
    deletePost(post.id);
    navigate('..', { relative: 'path' });
  };

  return (
    <div className="card">
      <Link to=".." relative="path" className="link-back">
        ← 게시판
      </Link>

      <div className="row between">
        <h2 style={{ margin: 0 }}>
          {post.isNotice && '📌 '}
          {post.title}
        </h2>
        {canDelete && (
          <div className="row">
            <Link to="edit" className="btn btn-ghost btn-sm">
              수정
            </Link>
            <button className="btn btn-danger btn-sm" onClick={onDelete}>
              삭제
            </button>
          </div>
        )}
      </div>
      <div className="meta" style={{ marginBottom: 14 }}>
        {findMemberName(members, post.authorId)} · {formatDateTime(post.createdAt)}
      </div>

      <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{post.content}</p>

      {post.event && (
        <div className="event-box">
          <dl>
            <dt>📅 날짜</dt>
            <dd>{post.event.date}</dd>
            {post.event.time && (
              <>
                <dt>⏰ 시간</dt>
                <dd>{post.event.time}</dd>
              </>
            )}
            {post.event.location && (
              <>
                <dt>📍 장소</dt>
                <dd>{post.event.location}</dd>
              </>
            )}
            {post.event.itemsToBring && (
              <>
                <dt>🎒 준비물</dt>
                <dd>{post.event.itemsToBring}</dd>
              </>
            )}
            {post.event.feeInfo && (
              <>
                <dt>💰 회비</dt>
                <dd>{post.event.feeInfo}</dd>
              </>
            )}
          </dl>

          <div className="row wrap">
            <button
              className={`btn btn-sm ${myAttendance === 'yes' ? 'btn-leaf' : 'btn-ghost'}`}
              onClick={() => setAttendance(post.id, member.id, 'yes')}
            >
              ✅ 참석
            </button>
            <button
              className={`btn btn-sm ${myAttendance === 'no' ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => setAttendance(post.id, member.id, 'no')}
            >
              ❌ 불참
            </button>
          </div>

          <div style={{ marginTop: 12, fontSize: 13 }}>
            <strong>참석 현황</strong>
            <div className="row wrap" style={{ marginTop: 6 }}>
              {approvedMembers.map((m) => {
                const status = post.event!.attendance.find((a) => a.memberId === m.id)?.status;
                return (
                  <span key={m.id} className="badge">
                    {status === 'yes' ? '✅' : status === 'no' ? '❌' : '⏳'} {m.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
