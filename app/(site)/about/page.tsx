import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  Users, 
  Globe, 
  Shield
} from "lucide-react";
import { env } from "@/config/application";

const About = () => {
  // Dados da equipe - podem ser substituídos por dados reais posteriormente
  const teamMembers = [
    {
      name: "Dra. Maria Silva",
      role: "Fundadora e Diretora Clínica",
      bio: "Psicóloga com mais de 15 anos de experiência em terapia cognitivo-comportamental e especialista em saúde mental digital.",
      imageUrl: "/placeholder.svg"
    },
    {
      name: "Dr. João Santos",
      role: "Diretor de Operações",
      bio: "Psicanalista com vasta experiência em gestão de serviços de saúde mental e implementação de plataformas digitais para cuidados psicológicos.",
      imageUrl: "/placeholder.svg"
    },
    {
      name: "Ana Oliveira",
      role: "Coordenadora de Supervisão Acadêmica",
      bio: "Especialista em formação e supervisão de novos profissionais, com foco em integração entre teoria e prática clínica.",
      imageUrl: "/placeholder.svg"
    },
    {
      name: "Pedro Costa",
      role: "Líder de Tecnologia",
      bio: "Desenvolvedor com foco em tecnologias para saúde mental e experiência em criação de plataformas seguras para terapia online.",
      imageUrl: "/placeholder.svg"
    }
  ];

  // Valores da empresa
  const values = [
    {
      title: "Acessibilidade",
      description: "Tornamos o cuidado com a saúde mental acessível para todos, independentemente de localização geográfica ou limitações físicas.",
      icon: <Globe className="h-8 w-8 text-therapy-primary" />
    },
    {
      title: "Confidencialidade",
      description: "Garantimos a privacidade e segurança das informações compartilhadas na plataforma, seguindo os mais rigorosos padrões éticos.",
      icon: <Shield className="h-8 w-8 text-therapy-primary" />
    },
    {
      title: "Educação Contínua",
      description: "Incentivamos o desenvolvimento profissional através de supervisão de qualidade e recursos educacionais atualizados.",
      icon: <BookOpen className="h-8 w-8 text-therapy-primary" />
    },
    {
      title: "Comunidade",
      description: "Promovemos a formação de uma comunidade colaborativa entre profissionais, estudantes e pacientes.",
      icon: <Users className="h-8 w-8 text-therapy-primary" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-therapy-light to-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-therapy-dark text-center mb-6">
              {`Sobre a ${env.applicationName}`}
            </h1>
            <p className="text-lg text-center max-w-3xl mx-auto text-therapy-dark/80">
              Conectando pacientes, profissionais e estudantes da área de psicologia 
              para promover saúde mental e bem-estar através de uma plataforma inovadora.
            </p>
          </div>
        </section>

        {/* Missão e Visão */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-16">
                <h2 className="text-3xl font-semibold mb-6 text-center">Nossa Missão</h2>
                <p className="text-lg text-therapy-dark/80">
                  A MindfulTherapy nasceu com o propósito de democratizar o acesso a serviços de saúde mental de qualidade, 
                  conectando pacientes a profissionais qualificados e oferecendo um espaço seguro para estudantes 
                  desenvolverem suas habilidades sob supervisão adequada. Acreditamos que a tecnologia pode 
                  ser uma poderosa aliada no cuidado psicológico, permitindo maior flexibilidade, 
                  acessibilidade e continuidade no atendimento.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold mb-6 text-center">Nossa Visão</h2>
                <p className="text-lg text-therapy-dark/80">
                  Buscamos ser a principal plataforma de conexão entre pacientes e profissionais de psicologia no Brasil, 
                  reconhecida pela excelência na qualidade dos serviços oferecidos, pela inovação tecnológica e pelo 
                  compromisso com a formação de novos profissionais. Queremos transformar a maneira como as pessoas acessam 
                  serviços de saúde mental, tornando-os mais acessíveis, eficientes e personalizados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-16 bg-therapy-light/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold mb-12 text-center">Nossos Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 rounded-full bg-therapy-light/50 p-4">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                      <p className="text-therapy-dark/70">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Equipe */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold mb-12 text-center">Nossa Equipe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                    <img 
                      src={member.imageUrl} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-therapy-primary font-medium mb-2">{member.role}</p>
                  <p className="text-center text-therapy-dark/70">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* História */}
        <section className="py-16 bg-therapy-light/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold mb-6 text-center">Nossa História</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-therapy-dark/80 mb-6">
                A MindfulTherapy foi fundada em 2023, quando um grupo de profissionais de psicologia e tecnologia 
                identificou a necessidade de uma plataforma que facilitasse o acesso a serviços de saúde mental 
                e que também pudesse apoiar estudantes em formação.
              </p>
              <p className="text-lg text-therapy-dark/80 mb-6">
                Após meses de pesquisa e desenvolvimento, lançamos nossa plataforma com o objetivo de criar 
                um ecossistema completo para pacientes, profissionais e estudantes, combinando tecnologia 
                de ponta com as melhores práticas em saúde mental.
              </p>
              <p className="text-lg text-therapy-dark/80">
                Hoje, continuamos crescendo e evoluindo, sempre com o compromisso de melhorar a qualidade 
                dos serviços de saúde mental no Brasil através da tecnologia e da conexão humana.
              </p>
            </div>
          </div>
        </section>

        {/* CTA - Contato */}
        <section className="py-16 bg-therapy-primary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-semibold mb-6">Entre em Contato Conosco</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Tem alguma dúvida ou sugestão? Nossa equipe está disponível para ajudar. 
              Entre em contato por e-mail ou através do formulário em nossa página de contato.
            </p>
            <div className="flex justify-center">
              <a 
                href="mailto:contato@mindfultherapy.com.br" 
                className="bg-therapy-primary text-white px-6 py-3 rounded-md font-medium hover:bg-therapy-primary/90 transition-colors"
              >
                contato@mindfultherapy.com.br
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
