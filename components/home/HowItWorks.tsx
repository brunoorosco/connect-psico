import Link from "next/link";
import Button from "../shared/Button";

const steps = [
  {
    number: "1",
    title: "Busque por profissionais",
    description: "Use nossos filtros para encontrar o profissional que melhor atende suas necessidades, considerando especialidade, abordagem e disponibilidade.",
  },
  {
    number: "2",
    title: "Agende sua consulta",
    description: "Escolha entre consulta online ou presencial e selecione o horário que melhor se encaixa na sua agenda.",
  },
  {
    number: "3",
    title: "Realize o pagamento",
    description: "Efetue o pagamento de forma segura diretamente pela plataforma usando seu método preferido.",
  },
  {
    number: "4",
    title: "Participe da sessão",
    description: "No dia e horário agendados, conecte-se à nossa plataforma para a sessão online ou dirija-se ao consultório para atendimento presencial.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-therapy-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-therapy-dark">
            Como funciona
          </h2>
          <p className="mt-4 text-lg text-therapy-dark/70 max-w-3xl mx-auto">
            Acessar cuidados psicológicos de qualidade nunca foi tão fácil.
            Siga estes passos simples para começar sua jornada de bem-estar.
          </p>
        </div>
        
        <div className="relative">
          {/* Linha de conexão */}
          <div className="absolute hidden lg:block left-[50%] top-24 bottom-24 w-0.5 bg-therapy-primary/30"></div>
          
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col lg:flex-row items-start lg:items-center gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="lg:w-1/2 flex justify-center">
                  <div className="w-full max-w-md">
                    <div className="bg-white rounded-xl shadow-md p-6 relative animate-fade-in" style={{animationDelay: `${index * 0.2}s`}}>
                      <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-therapy-primary text-white flex items-center justify-center font-bold text-xl shadow-md">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-bold text-therapy-dark mt-2">{step.title}</h3>
                      <p className="mt-2 text-therapy-dark/70">{step.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-1/2 hidden lg:flex justify-center items-center">
                  <div className="w-32 h-32 rounded-full border-4 border-therapy-primary/30 bg-therapy-light flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-therapy-primary/10 flex items-center justify-center">
                      <div className="text-therapy-primary text-4xl font-bold">{step.number}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-therapy-dark">Pronto para começar?</h3>
          <p className="mt-4 text-therapy-dark/70 max-w-2xl mx-auto">
            Dê o primeiro passo para cuidar da sua saúde mental hoje mesmo.
            Nossos profissionais qualificados estão prontos para te ajudar.
          </p>
          <div className="mt-8">
            <Link href="/terapeutas">
              <Button size="lg">Encontrar um Terapeuta</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
