-- Este script requiere que los usuarios existan en auth.users.
-- Ejecutar después del signup o insertar auth.users manualmente.

-- ============================================================
-- Profiles
-- ============================================================

INSERT INTO public.profiles (id, display_name, role, avatar_url, timezone, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'María Pérez', 'patient', NULL, 'America/Caracas', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Dr. Carlos Mendoza', 'psychologist', NULL, 'America/Caracas', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Dra. Ana Lucía Rivas', 'psychologist', NULL, 'America/Caracas', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Dr. José Gregorio Hernández', 'psychologist', NULL, 'America/Caracas', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'Dr. Luis Fernando Torres', 'psychologist', NULL, 'America/Caracas', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000006', 'Admin Sistema', 'psychologist', NULL, 'America/Caracas', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Psychologist Profiles
-- ============================================================

-- Psicólogo 1: verificado, disponible — duelo, ansiedad, depresión
INSERT INTO public.psychologist_profiles (
  id, full_name, license_number, license_document, license_verified,
  biography, specialties, languages, whatsapp_link, availability,
  is_available, years_experience, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Carlos Mendoza',
  'PSV-12345',
  'licencia_carlos_mendoza.pdf',
  TRUE,
  'Psicólogo clínico con más de 10 años de experiencia en terapia cognitivo-conductual. Apoyo en procesos de duelo, ansiedad y depresión.',
  ARRAY['duelo', 'ansiedad', 'depresion']::public.specialty[],
  ARRAY['español'],
  'https://wa.me/584141234567',
  '{"lunes": "09:00-17:00", "martes": "09:00-17:00", "miércoles": "09:00-17:00", "jueves": "09:00-17:00", "viernes": "09:00-13:00"}',
  TRUE,
  10,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Psicólogo 2: verificado, disponible — crisis_pánico, trauma, estrés
INSERT INTO public.psychologist_profiles (
  id, full_name, license_number, license_document, license_verified,
  biography, specialties, languages, whatsapp_link, availability,
  is_available, years_experience, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Ana Lucía Rivas',
  'PSV-67890',
  'licencia_ana_rivas.pdf',
  TRUE,
  'Especialista en manejo de crisis, ataques de pánico y trastornos de ansiedad. Atención a adolescentes y adultos.',
  ARRAY['ansiedad', 'crisis_panico', 'trauma', 'estres']::public.specialty[],
  ARRAY['español', 'inglés'],
  'https://wa.me/584142345678',
  '{"lunes": "08:00-16:00", "martes": "08:00-16:00", "miércoles": "08:00-16:00", "jueves": "08:00-16:00", "viernes": "08:00-12:00"}',
  TRUE,
  8,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Psicólogo 3: verificado, NO disponible — apoyo_niños, apoyo_adolescentes
INSERT INTO public.psychologist_profiles (
  id, full_name, license_number, license_document, license_verified,
  biography, specialties, languages, whatsapp_link, availability,
  is_available, years_experience, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'José Gregorio Hernández',
  'PSV-11111',
  'licencia_jose_hernandez.pdf',
  TRUE,
  'Psicólogo infantil y juvenil. Amplia experiencia en terapia de juego y acompañamiento a padres.',
  ARRAY['apoyo_ninos', 'apoyo_adolescentes']::public.specialty[],
  ARRAY['español'],
  'https://wa.me/584143456789',
  '{"lunes": "10:00-18:00", "martes": "10:00-18:00", "miércoles": "10:00-18:00", "jueves": "10:00-18:00", "viernes": "10:00-14:00"}',
  FALSE,
  15,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Psicólogo 4: NO verificado — violencia, adicciones
INSERT INTO public.psychologist_profiles (
  id, full_name, license_number, license_document, license_verified,
  biography, specialties, languages, whatsapp_link, availability,
  is_available, years_experience, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'Luis Fernando Torres',
  'PSV-22222',
  'licencia_luis_torres.pdf',
  FALSE,
  'Psicólogo comunitario con enfoque en víctimas de violencia y trastornos por consumo de sustancias.',
  ARRAY['violencia', 'adicciones', 'trauma']::public.specialty[],
  ARRAY['español'],
  'https://wa.me/584144567890',
  '{"lunes": "09:00-17:00", "martes": "09:00-17:00", "miércoles": "09:00-17:00", "jueves": "09:00-17:00", "viernes": "09:00-13:00"}',
  TRUE,
  5,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Appointment Requests
-- ============================================================

-- Solicitud pending: paciente 1 → psicólogo 1 (disponible, verificado)
INSERT INTO public.appointment_requests (
  id, psychologist_id, patient_id, patient_age, reason,
  preferred_schedule, status, consent_granted, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  28,
  ARRAY['ansiedad', 'estres']::public.specialty[],
  'Prefiero sesiones los martes en la tarde después de las 3pm',
  'pending',
  TRUE,
  NOW(),
  NOW()
);

-- Solicitud accepted: paciente 1 → psicólogo 2 (disponible, verificado)
INSERT INTO public.appointment_requests (
  id, psychologist_id, patient_id, patient_age, reason,
  preferred_schedule, status, consent_granted, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  28,
  ARRAY['crisis_panico']::public.specialty[],
  'Disponible los jueves en la mañana',
  'accepted',
  TRUE,
  NOW(),
  NOW()
);

-- ============================================================
-- Admin Roles
-- ============================================================

INSERT INTO public.admin_roles (id, user_id, created_at)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000006',
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;
