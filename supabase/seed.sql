-- =================================================================
--  Seed a test user
-- =================================================================
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new)
VALUES ('00000000-0000-0000-0000-000000000000', 'c882ff4b-ebee-425e-94f2-67c2a4b90670', 'authenticated', 'authenticated', 'test@example.com', crypt('test123', gen_salt('bf')), '2024-01-01 00:00:00+00', 'recovery-token', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', '{"provider":"email","providers":["email"]}', '{}', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES ('c882ff4b-ebee-425e-94f2-67c2a4b90670', '7e83a152-3788-4663-a705-02755255c27f', 'c882ff4b-ebee-425e-94f2-67c2a4b90670', '{"sub":"c882ff4b-ebee-425e-94f2-67c2a4b90670","email":"test@example.com"}', 'email', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =================================================================
--  Seed Projects, Tags, and Tasks
-- =================================================================
-- Note: We use fixed UUIDs for deterministic testing.
DO $$
DECLARE
    test_user_id UUID := 'c882ff4b-ebee-425e-94f2-67c2a4b90670';
    project_id_logos UUID := 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6';
    tag_id_urgent UUID := 'b1c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6';
    tag_id_design UUID := 'c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6';
    task_id_budget UUID := 'd1e2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6';
    task_id_mockups UUID := 'e1f2a3b4-c5d6-e7f8-a9b0-c1d2e3f4a5b6';
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
    INSERT INTO public.tasks (id, user_id, project_id, title, description, urgency, due_date)
    VALUES
        (task_id_budget, test_user_id, project_id_logos, 'Finalize Q3 budget proposal', 'Review feedback from the finance team and update the presentation deck.', 'High', now() + interval '3 days'),
        (task_id_mockups, test_user_id, project_id_logos, 'Develop landing page mockups', 'Create three different design directions for the new landing page.', 'Medium', now() + interval '1 week'),
        (gen_random_uuid(), test_user_id, project_id_logos, 'Onboard new marketing intern', NULL, 'Low', now() + interval '2 weeks'),
        (gen_random_uuid(), test_user_id, NULL, 'Review project requirements', NULL, 'High', now() + interval '1 day'),
        (gen_random_uuid(), test_user_id, NULL, 'Set up development environment', NULL, 'High', now() + interval '2 days'),
        (gen_random_uuid(), test_user_id, NULL, 'Create component library', NULL, 'Medium', now() + interval '4 days'),
        (gen_random_uuid(), test_user_id, NULL, 'Write unit tests', NULL, 'Medium', now() + interval '5 days'),
        (gen_random_uuid(), test_user_id, NULL, 'Update documentation', NULL, 'Low', now() + interval '1 week');

    -- Link tags to tasks
    INSERT INTO public.task_tags (task_id, tag_id)
    VALUES
        (task_id_budget, tag_id_urgent),
        (task_id_mockups, tag_id_design);

    -- Seed Schedule Items
    INSERT INTO public.schedule_items (user_id, title, start_time, end_time, color)
    VALUES
        (test_user_id, 'Project Standup', now() + interval '2 hours', now() + interval '2 hours 30 minutes', 'bg-blue-500'),
        (test_user_id, 'Design Review', now() + interval '5 hours', now() + interval '6 hours', 'bg-green-500'),
        (test_user_id, 'Focus Block: Code', now() + interval '8 hours', now() + interval '10 hours', 'bg-indigo-500');
END $$; 