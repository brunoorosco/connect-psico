import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  MessageCircle, 
  Video, 
  BookOpen, 
  UserCheck
} from "lucide-react";
import { env } from "@/config/application";

const HowItWorks = () => {
  const steps = [
    {
      title: "Encontre o terapeuta ideal",
      description: "Busque profissionais com base em especialidade, abordagem terapêutica, disponibilidade e formato de atendimento.",
      icon: <UserCheck className="h-12 w-12 text-therapy-primary" />
    },
    {
      title: "Verifique disponibilidade",
      description: "Consulte a agenda do profissional e escolha um horário que se adapte à sua rotina.",
      icon: <Calendar className="h-12 w-12 text-therapy-primary" />
    },
    {
      title: "Escolha o formato de atendimento",
      description: "Opte por sessões individuais, em grupo ou online, de acordo com sua preferência e necessidade.",
      icon: <Users className="h-12 w-12 text-therapy-primary" />
    },
    {
      title: "Realize o agendamento",
      description: "Marque sua consulta e compartilhe informações iniciais para otimizar seu primeiro atendimento.",
      icon: <BookOpen className="h-12 w-12 text-therapy-primary" />
    },
    {
      title: "Participe da sessão",
      description: "Conecte-se através de videoconferência ou compareça ao consultório no horário marcado.",
      icon: <Video className="h-12 w-12 text-therapy-primary" />
    },
    {
      title: "Mantenha contato",
      description: "Utilize nosso sistema de chat integrado para comunicação segura com seu profissional.",
      icon: <MessageCircle className="h-12 w-12 text-therapy-primary" />
    }
  ];

  const supervisaoSection = {
    title: "Para estudantes e profissionais em formação",
    items: [
      "Conexão com supervisores experientes na sua área de interesse",
      "Supervisão individual ou em grupo, adaptada às suas necessidades",
      "Documentação e acompanhamento do progresso da supervisão",
      "Horários flexíveis compatíveis com sua rotina acadêmica"
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-therapy-light to-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-therapy-dark text-center mb-6">
              {`Como Funciona a ${env.applicationName}`} 
            </h1>
            <p className="text-lg text-center max-w-3xl mx-auto text-therapy-dark/80">
              Nossa plataforma foi desenvolvida para conectar pacientes e profissionais 
              de forma simples, segura e eficaz. Conheça o processo passo a passo.
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-12">
              Processo simplificado para seu bem-estar
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <Card key={index} className="border-2 border-therapy-light hover:border-therapy-primary transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 rounded-full bg-therapy-light/30 p-3">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-therapy-dark/70">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* For Students Section */}
        <section className="py-16 bg-therapy-light/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-semibold text-center mb-8">
                {supervisaoSection.title}
              </h2>
              
              <div className="bg-white rounded-lg shadow-lg p-8">
                <ul className="space-y-4">
                  {supervisaoSection.items.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 mt-1 text-therapy-primary">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <p className="text-therapy-dark/80 text-lg">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-12">
              Perguntas Frequentes
            </h2>
            
            <div className="max-w-3xl mx-auto divide-y divide-gray-200">
              {[
                {
                  question: "Como escolher o terapeuta certo para mim?",
                  answer: "Nossa plataforma permite filtrar por especialidade, abordagem terapêutica, e outros critérios importantes. Recomendamos ler os perfis detalhados e as avaliações de outros pacientes para encontrar um profissional que atenda às suas necessidades específicas."
                },
                {
                  question: "Como funciona o pagamento das consultas?",
                  answer: "Oferecemos diversas opções de pagamento seguro através da plataforma. O valor é cobrado após a confirmação do agendamento e garantimos reembolso em caso de cancelamento dentro do prazo estabelecido pelo profissional."
                },
                {
                  question: "Posso fazer sessões de terapia em grupo?",
                  answer: "Sim! Muitos de nossos profissionais oferecem sessões em grupo. Estas sessões são uma ótima opção para quem busca aprender com experiências compartilhadas e construir uma rede de apoio, além de geralmente terem um custo mais acessível."
                },
                {
                  question: "Como funciona a supervisão para estudantes?",
                  answer: "Estudantes de psicologia e áreas relacionadas podem encontrar supervisores experientes na plataforma, que oferecem orientação profissional tanto individualmente quanto em grupo, ajudando no desenvolvimento de habilidades clínicas e no cumprimento dos requisitos acadêmicos."
                },
              ].map((faq, index) => (
                <div key={index} className="py-6">
                  <h3 className="text-xl font-medium text-therapy-dark">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-therapy-dark/70">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;