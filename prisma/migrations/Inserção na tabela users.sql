-- Inserção na tabela "users"
INSERT INTO "users" ("id", "name", "email", "role", "createdAt", "updatedAt", "image", "phone", "password", "isTwoFactorAuthEnabled")
VALUES
  ('user_1', 'Dra. Maria Silva', 'maria.silva@example.com', 'SUPERVISOR', NOW(), NOW(), 'https://randomuser.me/api/portraits/women/44.jpg', '11987654321', 'hashed_password_1', false),
  ('user_2', 'João P.', 'joao.p@example.com', 'DEFAULT', NOW(), NOW(), NULL, '11912345678', 'hashed_password_2', false),
  ('user_3', 'Ana M.', 'ana.m@example.com', 'DEFAULT', NOW(), NOW(), NULL, '11923456789', 'hashed_password_3', false),
  ('user_4', 'Carlos R.', 'carlos.r@example.com', 'DEFAULT', NOW(), NOW(), NULL, '11934567890', 'hashed_password_4', false),
  ('user_5', 'Dr. Pedro Almeida', 'pedro.almeida@example.com', 'SUPERVISOR', NOW(), NOW(), 'https://randomuser.me/api/portraits/mem/65.jpg', '21987654321', 'hashed_password_5', false),
  ('user_6', 'Mariana S.', 'mariana.s@example.com', 'DEFAULT', NOW(), NOW(), NULL, '21912345678', 'hashed_password_6', false),
  ('user_7', 'Lucas F.', 'lucas.f@example.com', 'DEFAULT', NOW(), NOW(), NULL, '21923456789', 'hashed_password_7', false),
  ('user_8', 'Dra. Fernanda Costa', 'fernanda.costa@example.com', 'SUPERVISOR', NOW(), NOW(), 'https://randomuser.me/api/portraits/women/68.jpg', '31987654321', 'hashed_password_8', false),
  ('user_9', 'Beatriz L.', 'beatriz.l@example.com', 'DEFAULT', NOW(), NOW(), NULL, '31912345678', 'hashed_password_9', false),
  ('user_10', 'Rafael M.', 'rafael.m@example.com', 'DEFAULT', NOW(), NOW(), NULL, '31923456789', 'hashed_password_10', false),
  ('user_11', 'Patrícia G.', 'patricia.g@example.com', 'DEFAULT', NOW(), NOW(), NULL, '41987654321', 'hashed_password_11', false),
  ('user_12', 'Dr. Gustavo Lima', 'gustavo.lima@example.com', 'SUPERVISOR', NOW(), NOW(), 'https://randomuser.me/api/portraits/men/45.jpg', '41912345678', 'hashed_password_12', false),
  ('user_13', 'Camila S.', 'camila.s@example.com', 'DEFAULT', NOW(), NOW(), NULL, '41923456789', 'hashed_password_13', false),
  ('user_14', 'Bruno H.', 'bruno.h@example.com', 'DEFAULT', NOW(), NOW(), NULL, '41934567890', 'hashed_password_14', false),
  ('user_15', 'Dra. Juliana A.', 'juliana.a@example.com', 'SUPERVISOR', NOW(), NOW(), 'https://randomuser.me/api/portraits/women/55.jpg', '51987654321', 'hashed_password_15', false),
  ('user_16', 'Felipe D.', 'felipe.d@example.com', 'DEFAULT', NOW(), NOW(), NULL, '51912345678', 'hashed_password_16', false),
  ('user_17', 'Vanessa R.', 'vanessa.r@example.com', 'DEFAULT', NOW(), NOW(), NULL, '51923456789', 'hashed_password_17', false),
  ('user_18', 'Dr. Leonardo P.', 'leonardo.p@example.com', 'SUPERVISOR', NOW(), NOW(), 'https://randomuser.me/api/portraits/men/67.jpg', '61987654321', 'hashed_password_18', false),
  ('user_19', 'Larissa M.', 'larissa.m@example.com', 'DEFAULT', NOW(), NOW(), NULL, '61912345678', 'hashed_password_19', false),
  ('user_20', 'Eduardo K.', 'eduardo.k@example.com', 'DEFAULT', NOW(), NOW(), NULL, '61923456789', 'hashed_password_20', false);

-- Inserção na tabela "professionals"
INSERT INTO "professionals" ("id", "num_conselho", "uf_conselho", "publico_alvo", "especialidade", "abordagem", "education", "bio", "valor_atendimento", "userId","updatedAt")
VALUES
  (1, '12345678', 'SP', ARRAY['Adultos','adolescentes'], ARRAY['Terapia Cognitivo-Comportamental', 'Ansiedade', 'Depressão', 'Desenvolvimento Pessoal'], 'Terapia Cognitivo-Comportamental', 'Mestrado em Psicologia Clínica - USP', 'Psicóloga clínica com mais de 10 anos de experiência em terapia cognitivo-comportamental, especializada em ansiedade e depressão.', 20000, 'user_1', NOW()),
  (2, '87654321', 'RJ', ARRAY['Crianças','famílias'], ARRAY['Psicologia Infantil', 'Terapia Familiar', 'TDAH', 'Autismo'], 'Terapia Sistêmica', 'Doutorado em Psicologia - UFRJ', 'Especialista em psicologia infantil e terapia familiar, com foco em TDAH e transtornos do espectro autista.', 25000, 'user_5',NOW()),
  (3, '45678912', 'MG', ARRAY['Adultos'], ARRAY['Psicanálise', 'Trauma', 'Relacionamentos', 'Estresse'], 'Psicanálise', 'Especialização em Psicanálise - PUC-MG', 'Psicanalista com experiência em traumas e questões relacionais, oferecendo um espaço seguro para reflexões profundas.', 18000, 'user_8',NOW()),
(4, '11223344', 'RS', ARRAY['Adultos','Casais'], ARRAY['Terapia de Casal', 'Comunicação', 'Autoestima'], 'Terapia Cognitivo-Comportamental', 'Mestrado em Psicologia Social - UFRGS', 'Especialista em terapia de casais e desenvolvimento de habilidades comunicativas.', 22000, 'user_12', NOW()),
  (5, '55667788', 'PR', ARRAY['Adolescentes','Adultos'], ARRAY['Ansiedade', 'Depressão', 'Autoconhecimento'], 'Terapia Humanista', 'Especialização em Psicologia Humanista - UFPR', 'Psicóloga com foco em autoconhecimento e tratamento de transtornos de humor.', 20000, 'user_15', NOW()),
  (6, '99887766', 'SC', ARRAY['Crianças','Adolescentes'], ARRAY['Psicopedagogia', 'Déficit de Atenção'], 'Psicopedagogia', 'Especialização em Psicopedagogia - FURB', 'Atua na área de psicopedagogia auxiliando crianças e adolescentes com dificuldades de aprendizagem.', 18000, 'user_18', NOW()),
  (7, '44332211', 'BA', ARRAY['Famílias','Adultos'], ARRAY['Terapia Familiar', 'Resolução de Conflitos'], 'Terapia Sistêmica', 'Doutorado em Psicologia Sistêmica - UFBA', 'Ajuda famílias e casais a desenvolverem estratégias para resolução de conflitos.', 24000, 'user_2', NOW()),
  (8, '66778899', 'PE', ARRAY['Adultos','Adolescentes'], ARRAY['Estresse', 'Burnout', 'Gestão Emocional'], 'Terapia Cognitivo-Comportamental', 'Mestrado em Saúde Mental - UFPE', 'Psicóloga clínica especializada em tratamento de estresse e burnout.', 23000, 'user_9', NOW()),
  (9, '33445566', 'CE', ARRAY['Adultos'], ARRAY['Ansiedade', 'Depressão', 'Autoestima'], 'Terapia Humanista', 'Especialização em Psicologia Clínica - UFC', 'Atendimento clínico focado na valorização pessoal e saúde emocional.', 21000, 'user_14', NOW()),
  (10, '77889900', 'GO', ARRAY['Crianças','Famílias'], ARRAY['Desenvolvimento Infantil', 'Psicologia Escolar'], 'Terapia Sistêmica', 'Mestrado em Educação e Psicologia - UFG', 'Trabalha com psicologia escolar e desenvolvimento infantil.', 19000, 'user_6', NOW()),
  (11, '55443322', 'AM', ARRAY['Adultos'], ARRAY['Trauma', 'Estresse Pós-Traumático'], 'Psicanálise', 'Especialização em Psicanálise - UFAM', 'Psicanalista com foco no tratamento de traumas e estresse pós-traumático.', 22000, 'user_11', NOW()),
  (12, '22113344', 'DF', ARRAY['Adultos','Adolescentes'], ARRAY['Autoconhecimento', 'Relacionamentos'], 'Terapia Humanista', 'Mestrado em Psicologia Existencial - UnB', 'Atua promovendo autoconhecimento e desenvolvimento emocional.', 20000, 'user_17', NOW()),
  (13, '66554433', 'MT', ARRAY['Famílias','Casais'], ARRAY['Terapia Familiar', 'Conflitos Conjugais'], 'Terapia Sistêmica', 'Doutorado em Psicologia Familiar - UFMT', 'Especialista em mediação de conflitos familiares e conjugais.', 25000, 'user_20', NOW());
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

-- Availabilities
INSERT INTO availabilities (id, professional_id, day_of_week, start_time, end_time, is_available) VALUES
  ('cl0a9x6b70001jz8f8cfv9zmh', 'user_1', 1, '2025-05-27 09:00:00', '2025-05-27 12:00:00', true),
  ('cl0a9x6b70002jz8f8cfv9zmh', 'user_1', 3, '2025-05-28 14:00:00', '2025-05-28 17:00:00', true),
  ('cl0a9x6b70003jz8f8cfv9zmh', 'user_8', 2, '2025-05-29 10:00:00', '2025-05-29 13:00:00', true),
  ('cl0a9x6b70004jz8f8cfv9zmh', 'user_5', 4, '2025-05-30 15:00:00', '2025-05-30 18:00:00', true),
  ('cl0a9x6b70005jz8f8cfv9zmh', 'user_5', 2, '2025-05-31 09:00:00', '2025-05-31 12:00:00', true),
  ('cl0a9x6b70006jz8f8cfv9zmh', 'user_1', 5, '2025-06-01 14:00:00', '2025-06-01 17:00:00', true),
  ('cl0a9x6b70007jz8f8cfv9zmh', 'user_8', 6, '2025-06-02 10:00:00', '2025-06-02 13:00:00', true),
  ('cl0a9x6b70008jz8f8cfv9zmh', 'user_9', 6, '2025-06-03 15:00:00', '2025-06-03 18:00:00', true),
  ('cl0a9x6b70009jz8f8cfv9zmh', 'user_1', 1, '2025-06-04 09:00:00', '2025-06-04 12:00:00', true),
  ('cl0a9x6b70010jz8f8cfv9zmh', 'user_5', 5, '2025-06-05 09:00:00', '2025-06-05 12:00:00', true),
  ('cl0a9x6b70011jz8f8cfv9zmh', 'user_8', 4, '2025-06-06 10:00:00', '2025-06-06 13:00:00', true),
  ('cl0a9x6b70012jz8f8cfv9zmh', 'user_9', 6, '2025-06-07 15:00:00', '2025-06-07 18:00:00', true),
  ('cl0a9x6b70013jz8f8cfv9zmh', 'user_1', 2, '2025-06-08 09:00:00', '2025-06-08 12:00:00', true),
  ('cl0a9x6b70014jz8f8cfv9zmh', 'user_5', 3, '2025-06-09 14:00:00', '2025-06-09 17:00:00', true),
  ('cl0a9x6b70015jz8f8cfv9zmh', 'user_8', 4, '2025-06-10 10:00:00', '2025-06-10 13:00:00', true),
  ('cl0a9x6b70016jz8f8cfv9zmh', 'user_9', 5, '2025-06-11 15:00:00', '2025-06-11 18:00:00', true),
  ('cl0a9x6b70017jz8f8cfv9zmh', 'user_1', 6, '2025-06-12 09:00:00', '2025-06-12 12:00:00', true),
  ('cl0a9x6b70018jz8f8cfv9zmh', 'user_5', 1, '2025-06-13 14:00:00', '2025-06-13 17:00:00', true),
  ('cl0a9x6b70019jz8f8cfv9zmh', 'user_8', 2, '2025-06-14 10:00:00', '2025-06-14 13:00:00', true),
  ('cl0a9x6b70020jz8f8cfv9zmh', 'user_9', 3, '2025-06-15 15:00:00', '2025-06-15 18:00:00', true);

-- Appointments
INSERT INTO appointments (id, professional_id, patient_id, appointment_date, status, created_at) VALUES
  ('cl0bax6b70021jz8f8cfv9zmh', 'user_1', 'user_2', '2025-05-27 10:30:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70022jz8f8cfv9zmh', 'user_1', 'user_3', '2025-05-28 14:30:00', 'PENDING', NOW()),
  ('cl0bax6b70023jz8f8cfv9zmh', 'user_8', 'user_4', '2025-05-29 11:00:00', 'CANCELLED', NOW()),
  ('cl0bax6b70024jz8f8cfv9zmh', 'user_8', 'user_4', '2025-05-30 11:00:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70025jz8f8cfv9zmh', 'user_9', 'user_3', '2025-05-31 16:00:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70026jz8f8cfv9zmh', 'user_5', 'user_2', '2025-06-01 09:30:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70027jz8f8cfv9zmh', 'user_1', 'user_5', '2025-06-02 15:00:00', 'PENDING', NOW()),
  ('cl0bax6b70028jz8f8cfv9zmh', 'user_8', 'user_6', '2025-06-03 11:00:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70029jz8f8cfv9zmh', 'user_9', 'user_7', '2025-06-04 16:00:00', 'CANCELLED', NOW()),
  ('cl0bax6b70030jz8f8cfv9zmh', 'user_5', 'user_8', '2025-06-05 10:30:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70031jz8f8cfv9zmh', 'user_1', 'user_9', '2025-06-06 14:00:00', 'PENDING', NOW()),
  ('cl0bax6b70032jz8f8cfv9zmh', 'user_8', 'user_2', '2025-06-07 11:00:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70033jz8f8cfv9zmh', 'user_9', 'user_3', '2025-06-08 15:30:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70034jz8f8cfv9zmh', 'user_5', 'user_4', '2025-06-09 09:00:00', 'PENDING', NOW()),
  ('cl0bax6b70035jz8f8cfv9zmh', 'user_1', 'user_5', '2025-06-10 13:00:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70036jz8f8cfv9zmh', 'user_8', 'user_6', '2025-06-11 10:30:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70037jz8f8cfv9zmh', 'user_9', 'user_7', '2025-06-12 14:30:00', 'CANCELLED', NOW()),
  ('cl0bax6b70038jz8f8cfv9zmh', 'user_5', 'user_8', '2025-06-13 09:30:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70039jz8f8cfv9zmh', 'user_1', 'user_9', '2025-06-14 15:00:00', 'CONFIRMED', NOW()),
  ('cl0bax6b70040jz8f8cfv9zmh', 'user_8', 'user_2', '2025-06-15 11:00:00', 'CONFIRMED', NOW());