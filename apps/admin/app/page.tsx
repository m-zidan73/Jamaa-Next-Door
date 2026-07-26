const cards = [
  ["Selfie queue", "Review pending, approved, rejected, and resubmitted selfies with explicit reasons."],
  ["Reports", "Inspect user, jama'ah, and message reports with blocking and moderation history."],
  ["Chats", "Open chat evidence only when policy allows it and log every admin access."],
  ["Audit logs", "Track every sensitive admin action with actor, target, timestamp, and reason."],
];

export default function AdminDashboard() {
  return (
    <main style={{ padding: 32 }}>
      <h1 style={{ fontSize: 40, marginBottom: 12 }}>Jamaa Next Door Admin</h1>
      <p style={{ color: "#AEB7B8", maxWidth: 760 }}>
        This portal assumes server-enforced administrator roles from Supabase. Never authorize admin access from a mutable client profile field.
      </p>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {cards.map(([title, body]) => (
          <article
            key={title}
            style={{
              border: "1px solid rgba(247,245,242,0.14)",
              borderRadius: 24,
              padding: 20,
              background: "rgba(247,245,242,0.08)",
            }}
          >
            <h2>{title}</h2>
            <p style={{ color: "#AEB7B8", lineHeight: 1.5 }}>{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
