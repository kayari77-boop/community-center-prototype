export default function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="empty">
      <span className="emoji">{emoji}</span>
      {text}
    </div>
  );
}
