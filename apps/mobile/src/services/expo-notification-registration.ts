import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { NotificationRegistration } from "../ports/notification-registration";

export function createExpoNotificationRegistration(client: SupabaseClient | null): NotificationRegistration {
  return {
    async registerAfterProfile() {
      if (!client) return;
      const { data: userData } = await client.auth.getUser();
      if (!userData.user) return;
      const { data: profile } = await client.from("profiles").select("id").eq("id", userData.user.id).maybeSingle();
      if (!profile) return;

      let permission = await Notifications.getPermissionsAsync();
      if (!permission.granted) {
        const { data: preference } = await client.from("notification_preferences")
          .select("permission_requested_at").eq("profile_id", userData.user.id).maybeSingle();
        if (preference?.permission_requested_at || !permission.canAskAgain) return;
        permission = await Notifications.requestPermissionsAsync();
      }
      if (!permission.granted) {
        await client.rpc("set_jamaah_notification_preference", { enabled: false });
        return;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) return;
      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      await client.rpc("register_device_token", { p_expo_push_token: token.data, p_platform: "android" });
      await client.rpc("set_jamaah_notification_preference", { enabled: true });
    },
  };
}

export const expoNotificationRegistration = createExpoNotificationRegistration(supabase);
