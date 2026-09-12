import { Link } from 'react-router-dom';

interface ZoneSpot {
  key: string;
  to?: string;
  emoji: string;
  name: string;
  desc: string;
  x: number; // 지도 위 가로 위치 (%)
  y: number; // 지도 위 세로 위치 (%)
  active: boolean;
}

const ZONES: ZoneSpot[] = [
  { key: 'clubs', to: '/clubs', emoji: '🎨', name: '동호회존', desc: '같은 관심사로 모이는 공간', x: 22, y: 60, active: true },
  { key: 'sharing', emoji: '🎁', name: '나눔존', desc: '준비 중이에요 (2차 개발)', x: 66, y: 28, active: false },
  { key: 'jobs', emoji: '💼', name: '구인구직존', desc: '준비 중이에요 (3차 개발)', x: 80, y: 70, active: false },
];

// 최종 목표는 "지도 위에 여러 존이 배치된" 커뮤니티 센터. 아이콘을 나열하는 대신,
// 실제 지도처럼 각 존을 서로 다른 위치에 배치하고 길로 이어서 보여준다.
// 지금은 동호회존만 실제로 동작하고, 나눔존/구인구직존은 자리만 미리 잡아둔다.
export default function HomePage() {
  return (
    <div className="page">
      <h1>🗺️ 커뮤니티 지도</h1>
      <p style={{ color: 'var(--ink-soft)' }}>궁금한 존을 눌러 들어가보세요.</p>

      <div className="map-canvas">
        <span className="map-compass">🧭</span>
        <svg className="map-path" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 22 60 C 32 38, 50 22, 66 28 C 78 32, 76 54, 80 70" />
        </svg>

        <span className="map-deco" style={{ left: '6%', top: '12%', fontSize: 30 }}>
          ☁️
        </span>
        <span className="map-deco" style={{ left: '48%', top: '8%', fontSize: 24 }}>
          ☁️
        </span>
        <span className="map-deco" style={{ left: '10%', top: '82%', fontSize: 34 }}>
          🌳
        </span>
        <span className="map-deco" style={{ left: '40%', top: '78%', fontSize: 26 }}>
          🌼
        </span>
        <span className="map-deco" style={{ left: '58%', top: '86%', fontSize: 28 }}>
          🌳
        </span>
        <span className="map-deco" style={{ left: '90%', top: '18%', fontSize: 26 }}>
          🌸
        </span>
        <span className="map-deco" style={{ left: '34%', top: '40%', fontSize: 22 }}>
          🍃
        </span>

        {ZONES.map((z) => {
          const content = (
            <>
              <span className="pin-icon">{z.emoji}</span>
              <span className="pin-label">
                {z.name}
                {!z.active && <span className="pin-badge">준비중</span>}
              </span>
              <span className="pin-desc">{z.desc}</span>
            </>
          );
          const style = { left: `${z.x}%`, top: `${z.y}%` };
          return z.active && z.to ? (
            <Link key={z.key} to={z.to} className="map-pin active" style={style}>
              {content}
            </Link>
          ) : (
            <div key={z.key} className="map-pin disabled" style={style}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
