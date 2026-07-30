import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type Job = {
  id: string;
  profile_id: string;
  jamaah_id: string;
  event_kind: string;
  title: string;
  body: string;
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { data: jobs, error } = await supabase.rpc("claim_due_notification_jobs", { batch_size: 100 });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let delivered = 0;
  for (const job of (jobs ?? []) as Job[]) {
    try {
      const { data: tokenRows, error: tokenError } = await supabase
        .from("device_tokens")
        .select("id, expo_push_token")
        .eq("profile_id", job.profile_id);
      if (tokenError) throw tokenError;

      const messages = (tokenRows ?? []).map((row) => ({
        to: row.expo_push_token,
        sound: "default",
        title: job.title,
        body: job.body,
        data: { jamaahId: job.jamaah_id, kind: job.event_kind, url: `jnd://jamaahs/${job.jamaah_id}` },
      }));

      if (messages.length) {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(messages),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(payload));

        const tickets = Array.isArray(payload.data) ? payload.data : [payload.data];
        for (let index = 0; index < tickets.length; index += 1) {
          const ticket = tickets[index];
          if (ticket?.details?.error === "DeviceNotRegistered" && tokenRows?.[index]) {
            await supabase.from("device_tokens").delete().eq("id", tokenRows[index].id);
          } else if (ticket?.status === "error") {
            throw new Error(ticket.message ?? "Expo rejected the push notification.");
          }
        }
      }

      await supabase.from("notifications").insert({
        profile_id: job.profile_id,
        jamaah_id: job.jamaah_id,
        kind: job.event_kind,
        title: job.title,
        body: job.body,
        delivery_status: messages.length ? "delivered" : "in_app_only",
        delivered_at: new Date().toISOString(),
        data: { jamaahId: job.jamaah_id, url: `jnd://jamaahs/${job.jamaah_id}` },
      });
      await supabase.rpc("complete_notification_job", { p_job_id: job.id });
      delivered += 1;
    } catch (jobError) {
      const message = jobError instanceof Error ? jobError.message : "Unknown delivery error";
      await supabase.rpc("retry_notification_job", {
        p_job_id: job.id,
        p_error: message,
        p_retry: /timeout|network|fetch|429|5\d\d/i.test(message),
      });
    }
  }

  return Response.json({ claimed: jobs?.length ?? 0, delivered });
});
