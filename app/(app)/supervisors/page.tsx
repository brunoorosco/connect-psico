import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink } from "lucide-react";
import PsychologistProfile from "@/components/PsychoProfile";

const Index = () => {
  const [selectedPsychologist, setSelectedPsychologist] = useState<
    number | null
  >(null);

  // Dados mockados para exemplo
  const psychologists = [
    {
      id: 1,
      name: "Dra. Maria Silva",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
      bio: "Psicóloga clínica com mais de 10 anos de experiência em terapia cognitivo-comportamental, especializada em ansiedade e depressão.",
      specialties: [
        { id: 1, name: "Terapia Cognitivo-Comportamental" },
        { id: 2, name: "Ansiedade" },
        { id: 3, name: "Depressão" },
        { id: 4, name: "Desenvolvimento Pessoal" },
      ],
      experience: "10+ anos de prática clínica",
      education: "Mestrado em Psicologia Clínica - USP",
      price: "R$ 200,00 / sessão",
      rating: 4.9,
      reviews: [
        {
          id: 1,
          author: "João P.",
          content:
            "Excelente profissional, muito atenciosa e competente. Me ajudou muito com questões de ansiedade.",
          rating: 5,
        },
        {
          id: 2,
          author: "Ana M.",
          content:
            "Ótimas sessões, ambiente acolhedor e muito profissionalismo.",
          rating: 5,
        },
        {
          id: 3,
          author: "Carlos R.",
          content:
            "Recomendo fortemente! Profissional extremamente capacitada.",
          rating: 4,
        },
      ],
    },
    // Adicione mais psicólogos aqui com a mesma estrutura
  ];

  if (selectedPsychologist !== null) {
    const psychologist = psychologists.find(
      (p) => p.id === selectedPsychologist
    );
    if (psychologist) {
      return (
        <PsychologistProfile
          {...psychologist}
          onBack={() => setSelectedPsychologist(null)}
        />
      );
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-primary-light to-white p-4 md:p-8'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-3xl font-bold text-center mb-8 text-primary-dark'>
          Encontre seu Psicólogo
        </h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {psychologists.map((psych) => (
            <Card
              key={psych.id}
              className='p-6 backdrop-blur-sm bg-card/90 hover:shadow-lg transition-all duration-300 cursor-pointer group'
              onClick={() => setSelectedPsychologist(psych.id)}
            >
              <div className='flex items-start gap-4'>
                <div className='relative'>
                  <img
                    src={psych.image}
                    alt={psych.name}
                    className='w-20 h-20 rounded-full object-cover border-2 border-primary'
                  />
                  <Badge className='absolute -top-2 -right-2 bg-primary text-white'>
                    <Star className='w-3 h-3 mr-1' />
                    {psych.rating}
                  </Badge>
                </div>
                <div className='flex-1'>
                  <div className='flex items-start justify-between'>
                    <h2 className='text-xl font-semibold mb-2 group-hover:text-primary transition-colors'>
                      {psych.name}
                    </h2>
                    <ExternalLink className='w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>
                  <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                    {psych.bio}
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {psych.specialties.slice(0, 2).map((specialty) => (
                      <Badge
                        key={specialty.id}
                        className='bg-accent text-primary-dark'
                      >
                        {specialty.name}
                      </Badge>
                    ))}
                    {psych.specialties.length > 2 && (
                      <Badge variant='outline'>
                        +{psych.specialties.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className='mt-4 grid grid-cols-2 gap-4 text-sm'>
                <div className='text-center p-2 bg-primary/5 rounded-md'>
                  <p className='font-semibold text-primary-dark'>Experiência</p>
                  <p className='text-gray-600'>{psych.experience}</p>
                </div>
                <div className='text-center p-2 bg-primary/5 rounded-md'>
                  <p className='font-semibold text-primary-dark'>Valor</p>
                  <p className='text-gray-600'>{psych.price}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
