export default function ChatsPage() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Chats</h1>
      <p style={{ color: "#AEB7B8", maxWidth: 720 }}>
        Only joined participants may chat. Administrator access to chat evidence must write an audit-log row every time, and ordinary chat should be deleted immediately after conclusion unless formally reported.
      </p>
    </main>
  );
}
