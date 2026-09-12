import { useEffect } from 'react';
import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { useAppStore } from '../core/store/appStore';
import HomePage from './pages/HomePage';
import ClubZoneHomePage from './pages/ClubZoneHomePage';
import ClubCreatePage from './pages/ClubCreatePage';
import ClubDetailLayout from './pages/ClubDetailLayout';
import BoardTab from './pages/BoardTab';
import PostDetailPage from './pages/PostDetailPage';
import PostEditorPage from './pages/PostEditorPage';
import EventsTab from './pages/EventsTab';
import FeesTab from './pages/FeesTab';
import FilesTab from './pages/FilesTab';
import ChatTab from './pages/ChatTab';
import MembersTab from './pages/MembersTab';

export default function App() {
  const currentUserName = useAppStore((s) => s.currentUserName);
  const setCurrentUserName = useAppStore((s) => s.setCurrentUserName);
  const seedDemoData = useAppStore((s) => s.seedDemoData);

  useEffect(() => {
    seedDemoData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <header className="app-header">
        <Link to="/" className="brand">
          🏠 본부 커뮤니티 센터
        </Link>
        <div className="user-chip">
          👤
          <input
            value={currentUserName}
            onChange={(e) => setCurrentUserName(e.target.value)}
            aria-label="내 이름"
          />
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/clubs" element={<ClubZoneHomePage />} />
        <Route path="/clubs/new" element={<ClubCreatePage />} />
        <Route path="/clubs/:clubId" element={<ClubDetailLayout />}>
          <Route index element={<Navigate to="board" replace />} />
          <Route path="board" element={<BoardTab />} />
          <Route path="board/new" element={<PostEditorPage />} />
          <Route path="board/:postId" element={<PostDetailPage />} />
          <Route path="board/:postId/edit" element={<PostEditorPage />} />
          <Route path="events" element={<EventsTab />} />
          <Route path="fees" element={<FeesTab />} />
          <Route path="files" element={<FilesTab />} />
          <Route path="chat" element={<ChatTab />} />
          <Route path="members" element={<MembersTab />} />
        </Route>
      </Routes>
    </>
  );
}
