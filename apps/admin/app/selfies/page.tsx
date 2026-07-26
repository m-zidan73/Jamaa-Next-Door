const queue = [
  { status: "pending", note: "Show signed selfie URL only to the assigned admin reviewer." },
  { status: "rejected", note: "Rejections must capture a reason and allow resubmission." },
  { status: "approved", note: "Approved means admin-reviewed selfie only, not government ID validation." },
];

export default function SelfiesPage() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Selfie Review</h1>
      {queue.map((item) => (
        <div
          key={item.status}
          style={{
            marginTop: 16,
            padding: 20,
            borderRadius: 20,
            border: "1px solid rgba(247,245,242,0.14)",
          }}
        >
          <strong>{item.status}</strong>
          <p style={{ color: "#AEB7B8" }}>{item.note}</p>
        </div>
      ))}
    </main>
  );
}
