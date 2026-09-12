import { Link } from 'react-router-dom';

// 최종 목표는 "지도 위에 여러 존이 배치된" 커뮤니티 센터. 지금은 동호회존만
// 실제로 동작하고, 나눔존/구인구직존은 향후 개발 예정임을 보여주는 자리만 잡아둔다.
export default function HomePage() {
  return (
    <div className="page">
      <h1>🗺️ 커뮤니티 지도</h1>
      <p style={{ color: 'var(--ink-soft)' }}>궁금한 존을 눌러 들어가보세요.</p>

      <div className="grid-zones">
        <Link to="/clubs" className="zone-card active">
          <span className="emoji">🎨</span>
          <h3>동호회존</h3>
          <p>같은 관심사로 모이는 동호회 공간</p>
        </Link>

        <div className="zone-card disabled">
          <span className="emoji">🎁</span>
          <h3>나눔존</h3>
          <p>준비 중이에요 (2차 개발)</p>
        </div>

        <div className="zone-card disabled">
          <span className="emoji">💼</span>
          <h3>구인구직존</h3>
          <p>준비 중이에요 (3차 개발)</p>
        </div>
      </div>
    </div>
  );
}
