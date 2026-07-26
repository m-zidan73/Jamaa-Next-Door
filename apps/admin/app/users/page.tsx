export default function UsersPage() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Users</h1>
      <p style={{ color: "#AEB7B8", maxWidth: 720 }}>
        Search should cover account status, verification state, joined-count summaries, deletion requests, and audit history. Administrator controls must always require a reason and write to the audit log.
      </p>
    </main>
  );
}
