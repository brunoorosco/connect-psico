-- Inserção na tabela "users"
INSERT INTO "users" ("id", "name", "email", "role", "createdAt", "updatedAt", "image", "phone", "password", "isTwoFactorAuthEnabled")
VALUES
  ('user_1', 'Dra. Maria Silva', 'maria.silva@example.com', 'SUPERVISOR', NOW(), NOW(), 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80', '11987654321', 'hashed_password_1', false),
  ('user_2', 'João P.', 'joao.p@example.com', 'DEFAULT', NOW(), NOW(), NULL, '11912345678', 'hashed_password_2', false),
  ('user_3', 'Ana M.', 'ana.m@example.com', 'DEFAULT', NOW(), NOW(), NULL, '11923456789', 'hashed_password_3', false),
  ('user_4', 'Carlos R.', 'carlos.r@example.com', 'DEFAULT', NOW(), NOW(), NULL, '11934567890', 'hashed_password_4', false),
  ('user_5', 'Dr. Pedro Almeida', 'pedro.almeida@example.com', 'SUPERVISOR', NOW(), NOW(), 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80', '21987654321', 'hashed_password_5', false),
  ('user_6', 'Mariana S.', 'mariana.s@example.com', 'DEFAULT', NOW(), NOW(), NULL, '21912345678', 'hashed_password_6', false),
  ('user_7', 'Lucas F.', 'lucas.f@example.com', 'DEFAULT', NOW(), NOW(), NULL, '21923456789', 'hashed_password_7', false),
  ('user_8', 'Dra. Fernanda Costa', 'fernanda.costa@example.com', 'SUPERVISOR', NOW(), NOW(), 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80', '31987654321', 'hashed_password_8', false),
  ('user_9', 'Beatriz L.', 'beatriz.l@example.com', 'DEFAULT', NOW(), NOW(), NULL, '31912345678', 'hashed_password_9', false),
  ('user_10', 'Rafael M.', 'rafael.m@example.com', 'DEFAULT', NOW(), NOW(), NULL, '31923456789', 'hashed_password_10', false);

-- Inserção na tabela "professionals"
INSERT INTO "professionals" ("id", "num_conselho", "uf_conselho", "publico_alvo", "especialidade", "abordagem", "education", "bio", "valor_atendimento", "userId")
VALUES
  (1, '12345678', 'SP', 'Adultos e adolescentes', ARRAY['Terapia Cognitivo-Comportamental', 'Ansiedade', 'Depressão', 'Desenvolvimento Pessoal'], 'Terapia Cognitivo-Comportamental', 'Mestrado em Psicologia Clínica - USP', 'Psicóloga clínica com mais de 10 anos de experiência em terapia cognitivo-comportamental, especializada em ansiedade e depressão.', 20000, 'user_1'),
  (2, '87654321', 'RJ', 'Crianças e famílias', ARRAY['Psicologia Infantil', 'Terapia Familiar', 'TDAH', 'Autismo'], 'Terapia Sistêmica', 'Doutorado em Psicologia - UFRJ', 'Especialista em psicologia infantil e terapia familiar, com foco em TDAH e transtornos do espectro autista.', 25000, 'user_5'),
  (3, '45678912', 'MG', 'Adultos', ARRAY['Psicanálise', 'Trauma', 'Relacionamentos', 'Estresse'], 'Psicanálise', 'Especialização em Psicanálise - PUC-MG', 'Psicanalista com experiência em traumas e questões relacionais, oferecendo um espaço seguro para reflexões profundas.', 18000, 'user_8');

-- Inserção na tabela "comentarios"
INSERT INTO "comentarios" ("id", "content", "rating", "userId", "professionalId")
VALUES
  (1, 'Excelente profissional, muito atenciosa e competente. Me ajudou muito com questões de ansiedade.', '5', 'user_2', 1),
  (2, 'Ótimas sessões, ambiente acolhedor e muito profissionalismo.', '5', 'user_3', 1),
  (3, 'Recomendo fortemente! Profissional extremamente capacitada.', '4', 'user_4', 1),
  (4, 'Muito paciente e dedicada, ajudou meu filho a lidar com o TDAH.', '5', 'user_6', 2),
  (5, 'As sessões familiares foram transformadoras para nossa dinâmica.', '4', 'user_7', 2),
  (6, 'Profissional muito acolhedora, me ajudou a entender melhor meus traumas.', '5', 'user_9', 3),
  (7, 'As sessões são intensas, mas muito enriquecedoras.', '4', 'user_10', 3);

-- Disponibilidades (Availability)
INSERT INTO availabilities (id, professional_id, day_of_week, start_time, end_time, is_available) VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'user_1', 1, '2025-05-15 09:00:00', '2025-05-13 12:00:00', true),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'user_1', 3, '2025-05-16 14:00:00', '2025-05-15 17:00:00', true),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'user_8', 2, '2025-05-15 10:00:00', '2025-05-14 13:00:00', true),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'user_5', 4, '2025-05-15 15:00:00', '2025-05-16 18:00:00', true);
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'user_5', 1, '2025-05-19 09:00:00', '2025-05-13 12:00:00', true),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'user_1', 3, '2025-05-15 14:00:00', '2025-05-15 17:00:00', true),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'user_8', 2, '2025-05-16 10:00:00', '2025-05-14 13:00:00', true),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'user_9', 4, '2025-05-16 15:00:00', '2025-05-16 18:00:00', true);
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'user_1', 1, '2025-05-13 09:00:00', '2025-05-13 12:00:00', true),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'user_5', 3, '2025-05-15 09:00:00', '2025-05-15 12:00:00', true),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'user_8', 2, '2025-05-14 10:00:00', '2025-05-14 13:00:00', true),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'user_9', 4, '2025-05-16 15:00:00', '2025-05-16 18:00:00', true);

-- Appointments (Consultas agendadas)
INSERT INTO appointments (id, professional_id, patient_id, appointment_date, status, created_at) VALUES
  ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'user_1', 'user_2', '2025-05-15 10:30:00', 'CONFIRMED', NOW()),
  ('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', 'user_1', 'user_3', '2025-05-15 14:30:00', 'PENDING', NOW()),
  ('g7g7g7g7-g7g7-g7g7-g7g7-g7g7g7g7g7g7', 'user_8', 'user_4', '2025-05-15 11:00:00', 'CANCELLED', NOW()),
  ('g7g7g7g7-g7g7-g7g7-g7g7-g7g7g7g7g7g7', 'user_8', 'user_4', '2025-05-16 11:00:00', 'CONFIRMED', NOW()),
  ('h8h8h8h8-h8h8-h8h8-h8h8-h8h8h8h8h8h8', 'user_9', 'user_3', '2025-05-16 16:00:00', 'CONFIRMED', NOW());