import { Tutorial, TutorialCategory } from "@/domain/model/tutorial"

export const mockTutorials: Tutorial[] = [
  {
    id: "1",
    title: "Como Criar seu Template de Atestado",
    description: "Tutorial pra geração de templates",
    content:
      "Este tutorial vai te ensinar a criar um template de atestado, e deste mesmo modo também serve para os outros modelos de documentos.\n" +
      "\n## Passo 1: Acessar o menu Configurações -> Modelos de Documentos\n" +
      "\n- Na aba Corpo, escolha o tipo de documento(Atestado para este exemplo)\n" +
      "\n- nesta mesma aba, temos um texto pre-definido usado no documento do tipo Atestado, se precisar editar, basta alterar as informações conforme sua necessidade\n" +
      "\n- Já na aba Cabeçalho/rodapé, vocÊ pode configurar as cores de cabeçalho, rodapé, altura individual de cada um"+
      "no modo arrasta e puxa, você consegue inserir imagens, textos diversos, assinatura e qrcode. É possivel ter o controle individual de cada item.\n" +
      "\n",
    videoUrl:
      "https://player.cloudinary.com/embed/?cloud_name=dzxtgruga&public_id=Gravac%CC%A7a%CC%83o_de_Tela_2025-09-11_a%CC%80s_20.57.57_pulixw&profile=cld-default",
    category: "Documentos",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    title: "Configurações Avançadas",
    description: "Personalizando sua experiência",
    content:
      "# Configurações Avançadas\n\nAprenda a personalizar sua conta e configurar preferências avançadas.\n\n## Configurações de Perfil\n\nPersonalize suas informações pessoais...\n\n## Configurações de Notificação\n\nGerencie como e quando você recebe notificações...",
    videoUrl:
      "https://player.cloudinary.com/embed/?cloud_name=dzxtgruga&public_id=Gravac%CC%A7a%CC%83o_de_Tela_2025-09-11_a%CC%80s_20.57.57_pulixw&profile=cld-default",
    category: "Avançado",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: "3",
    title: "Troubleshooting Comum",
    description: "Resolvendo problemas frequentes",
    content:
      "# Troubleshooting Comum\n\nSoluções para os problemas mais comuns enfrentados pelos usuários.\n\n## Problema: Login não funciona\n\n**Solução:** Verifique se você está usando o email correto...\n\n## Problema: Página não carrega\n\n**Solução:** Limpe o cache do navegador...",
    videoUrl:
      "https://player.cloudinary.com/embed/?cloud_name=dzxtgruga&public_id=Gravac%CC%A7a%CC%83o_de_Tela_2025-09-11_a%CC%80s_20.57.57_pulixw&profile=cld-default",
    category: "Suporte",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
  },
]

export const mockCategories: TutorialCategory[] = [
  {
    id: "iniciante",
    name: "Pacientes",
    description: "Tutoriais para quem está começando",
    tutorials: mockTutorials.filter((t) => t.category === "Iniciante"),
  },
  {
    id: "avancado",
    name: "Documentos",
    description: "Funcionalidades avançadas da plataforma",
    tutorials: mockTutorials.filter((t) => t.category === "Avançado"),
  },
  {
    id: "suporte",
    name: "Suporte",
    description: "Soluções para problemas comuns",
    tutorials: mockTutorials.filter((t) => t.category === "Suporte"),
  },
]
