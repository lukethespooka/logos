-- =================================================================
--  Seed a test user
-- =================================================================
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new)
VALUES ('00000000-0000-0000-0000-000000000000', '8d2b90f4-2b48-43ab-a316-f2882197d1e3', 'authenticated', 'authenticated', 'test@example.com', crypt('password123', gen_salt('bf')), '2024-01-01 00:00:00+00', 'recovery-token', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', '{"provider":"email","providers":["email"]}', '{}', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES ('8d2b90f4-2b48-43ab-a316-f2882197d1e3', '7e83a152-3788-4663-a705-02755255c27f', '8d2b90f4-2b48-43ab-a316-f2882197d1e3', '{"sub":"8d2b90f4-2b48-43ab-a316-f2882197d1e3","email":"test@example.com"}', 'email', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =================================================================
--  Seed Projects, Tags, and Tasks
-- =================================================================
-- Note: We use fixed UUIDs for deterministic testing.
DO $$
DECLARE
    test_user_id UUID := '8d2b90f4-2b48-43ab-a316-f2882197d1e3';
    project_id_logos UUID := 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6';
    tag_id_urgent UUID := 'b1c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6';
    tag_id_design UUID := 'c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6';
BEGIN
    -- Seed Project
    INSERT INTO public.projects (id, user_id, name)
    VALUES (project_id_logos, test_user_id, 'LogOS Project')
    ON CONFLICT (id) DO NOTHING;

    -- Seed Tags
    INSERT INTO public.tags (id, user_id, name)
    VALUES
        (tag_id_urgent, test_user_id, '#urgent'),
        (tag_id_design, test_user_id, '#design')
    ON CONFLICT (id) DO NOTHING;

    -- Seed Tasks
    INSERT INTO public.tasks (user_id, project_id, title, description, urgency, due_date)
    VALUES
        (test_user_id, project_id_logos, 'Finalize Q3 budget proposal', 'Review feedback from the finance team and update the presentation deck.', 'High', now() + interval '3 days'),
        (test_user_id, project_id_logos, 'Develop landing page mockups', 'Create three different design directions for the new landing page.', 'Medium', now() + interval '1 week'),
        (test_user_id, project_id_logos, 'Onboard new marketing intern', NULL, 'Low', now() + interval '2 weeks');

    -- Link tags to tasks
    INSERT INTO public.task_tags (task_id, tag_id)
    SELECT t.id, tag_id_urgent FROM public.tasks t WHERE t.title = 'Finalize Q3 budget proposal'
    ON CONFLICT (task_id, tag_id) DO NOTHING;

    INSERT INTO public.task_tags (task_id, tag_id)
    SELECT t.id, tag_id_design FROM public.tasks t WHERE t.title = 'Develop landing page mockups'
    ON CONFLICT (task_id, tag_id) DO NOTHING;
END $$; 