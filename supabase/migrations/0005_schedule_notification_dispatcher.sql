-- Provision jnd_project_url and jnd_publishable_key in Vault before applying this migration.
select cron.schedule(
  'dispatch-jamaah-notifications', '* * * * *',
  $job$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'jnd_project_url') || '/functions/v1/dispatch-notification-jobs',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'jnd_publishable_key')
      ),
      body := '{}'::jsonb
    );
  $job$
);
