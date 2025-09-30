import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserCheck, Users, BookOpen, MessageCircle, HeadphonesIcon, VideoIcon, Calendar, Link } from "lucide-react"

const Resources = () => {
  const resourceCategories = {
    individual: [
      {
        title: "Terapia Individual Online",
        description: "Sessões de terapia por videoconferência com total privacidade e segurança.",
        icon: <VideoIcon className="h-10 w-10 text-therapy-primary" />,
        benefits: [
          "Flexibilidade de horário",
          "Acesso de qualquer lugar",
          "Sem deslocamentos",
          "Mesma qualidade da terapia presencial",
        ],
        link: "/terapeutas?type=online",
      },
      {
        title: "Terapia Individual Presencial",
        description:
          "Atendimento face a face em consultório, com toda a atenção personalizada para seu processo terapêutico.",
        icon: <UserCheck className="h-10 w-10 text-therapy-primary" />,
        benefits: [
          "Ambiente terapêutico dedicado",
          "Comunicação não-verbal facilitada",
          "Experiência tradicional de terapia",
        ],
        link: "/terapeutas?type=inperson",
      },
      {
        title: "Aconselhamento Pontual",
        description: "Sessões únicas para situações específicas que necessitam de orientação profissional.",
        icon: <Calendar className="h-10 w-10 text-therapy-primary" />,
        benefits: ["Resolução de questões específicas", "Sem compromisso continuado", "Orientação especializada"],
        link: "/terapeutas?type=counseling",
      },
    ],
    group: [
      {
        title: "Terapia em Grupo",
        description: "Sessões terapêuticas em grupo para compartilhar experiências e construir redes de apoio.",
        icon: <Users className="h-10 w-10 text-therapy-primary" />,
        benefits: [
          "Custo mais acessível",
          "Aprendizado com diferentes perspectivas",
          "Desenvolvimento de habilidades sociais",
          "Sentimento de pertencimento",
        ],
        link: "/terapeutas?type=group",
      },
      {
        title: "Grupos Temáticos",
        description: "Grupos focados em temas específicos como ansiedade, luto, relacionamentos, entre outros.",
        icon: <MessageCircle className="h-10 w-10 text-therapy-primary" />,
        benefits: [
          "Foco em questões específicas",
          "Compartilhamento de estratégias",
          "Apoio mútuo entre participantes",
        ],
        link: "/terapeutas?type=themed",
      },
      {
        title: "Workshops Terapêuticos",
        description: "Atividades práticas em grupo para desenvolvimento de habilidades específicas.",
        icon: <BookOpen className="h-10 w-10 text-therapy-primary" />,
        benefits: ["Aprendizado prático", "Duração definida", "Objetivos claros", "Materiais de apoio"],
        link: "/terapeutas?type=workshop",
      },
    ],
    professional: [
      {
        title: "Supervisão Individual",
        description: "Acompanhamento personalizado para estudantes e profissionais em formação.",
        icon: <HeadphonesIcon className="h-10 w-10 text-therapy-primary" />,
        benefits: [
          "Feedback detalhado sobre casos",
          "Desenvolvimento de habilidades clínicas",
          "Suporte ético e profissional",
        ],
        link: "/terapeutas?type=supervision",
      },
      {
        title: "Supervisão em Grupo",
        description: "Supervisão clínica em grupo para troca de experiências entre profissionais.",
        icon: <Users className="h-10 w-10 text-therapy-primary" />,
        benefits: [
          "Aprendizado compartilhado",
          "Networking profissional",
          "Custo reduzido",
          "Diversidade de casos e abordagens",
        ],
        link: "/terapeutas?type=group-supervision",
      },
      {
        title: "Mentoria para Carreira",
        description: "Orientação profissional para desenvolvimento de carreira na área da psicologia e psicanálise.",
        icon: <Link className="h-10 w-10 text-therapy-primary" />,
        benefits: [
          "Planejamento de carreira",
          "Orientação sobre especialização",
          "Desenvolvimento profissional continuado",
        ],
        link: "/terapeutas?type=mentoring",
      },
    ],
  }

  const materialEducativo = [
    {
      title: "Artigos sobre Saúde Mental",
      description: "Conteúdo científico e informativo sobre diversos aspectos da saúde mental.",
      tag: "Leitura",
    },
    {
      title: "Podcasts Recomendados",
      description: "Seleção de podcasts sobre psicologia, psicanálise e bem-estar emocional.",
      tag: "Áudio",
    },
    {
      title: "Vídeos Educativos",
      description: "Conteúdo visual sobre técnicas terapêuticas e conceitos importantes em saúde mental.",
      tag: "Vídeo",
    },
    {
      title: "Guias de Autoajuda",
      description: "Material estruturado para auxiliar no autoconhecimento e manejo de questões emocionais.",
      tag: "Prático",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-therapy-light to-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-therapy-dark text-center mb-6">Recursos Terapêuticos</h1>
            <p className="text-lg text-center max-w-3xl mx-auto text-therapy-dark/80">
              Conheça todas as opções de atendimento e recursos disponíveis na nossa plataforma para pacientes,
              estudantes e profissionais.
            </p>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="individual" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="individual">Individual</TabsTrigger>
                  <TabsTrigger value="group">Grupos</TabsTrigger>
                  <TabsTrigger value="professional">Profissionais</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="individual" className="mt-6">
                <h2 className="text-3xl font-semibold text-center mb-10">Atendimentos Individuais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {resourceCategories.individual.map((resource, index) => (
                    <ResourceCard key={index} resource={resource} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="group" className="mt-6">
                <h2 className="text-3xl font-semibold text-center mb-10">Atendimentos em Grupo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {resourceCategories.group.map((resource, index) => (
                    <ResourceCard key={index} resource={resource} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="professional" className="mt-6">
                <h2 className="text-3xl font-semibold text-center mb-10">Para Estudantes e Profissionais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {resourceCategories.professional.map((resource, index) => (
                    <ResourceCard key={index} resource={resource} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Material Educativo Section */}
        <section className="py-16 bg-therapy-light/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-10">Material Educativo</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {materialEducativo.map((item, index) => (
                <Card
                  key={index}
                  className="border-2 border-therapy-light hover:border-therapy-primary transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{item.title}</CardTitle>
                      <Badge variant="outline" className="bg-therapy-light/50">
                        {item.tag}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{item.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="text-therapy-primary">
                      Explorar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-semibold mb-6">Pronto para começar sua jornada terapêutica?</h2>
              <p className="text-lg mb-8 text-therapy-dark/80">
                Encontre o profissional ou grupo ideal para suas necessidades e dê o primeiro passo em direção ao seu
                bem-estar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/terapeutas">
                  <Button size="lg" className="bg-therapy-primary hover:bg-therapy-primary/90">
                    Encontrar Terapeuta
                  </Button>
                </Link>
                <Link href={"https://blog.amorsaude.com.br/terapia/"}>
                  <Button size="lg" variant="outline">
                    Saiba mais sobre terapia
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

const ResourceCard = ({ resource }: { resource: any }) => {
  return (
    <Card className="border-2 border-therapy-light hover:border-therapy-primary transition-all duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-therapy-light/30 p-3">{resource.icon}</div>
        </div>
        <CardTitle className="text-center">{resource.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-center text-therapy-dark/70 mb-4">{resource.description}</p>
        <ul className="space-y-2">
          {resource.benefits.map((benefit: string, index: number) => (
            <li key={index} className="flex items-start">
              <div className="mr-2 mt-1 text-therapy-primary">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <p className="text-sm text-therapy-dark/80">{benefit}</p>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-2 flex justify-center">
        <Button asChild>
          <a href={resource.link}>Explorar</a>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default Resources
