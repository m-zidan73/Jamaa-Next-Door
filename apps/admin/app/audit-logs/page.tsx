export default function AuditLogsPage() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Audit Logs</h1>
      <p style={{ color: "#AEB7B8", maxWidth: 720 }}>
        Each sensitive action should capture the administrator ID, action, target, reason, and timestamp. This screen is intentionally read-only.
      </p>
    </main>
  );
}
