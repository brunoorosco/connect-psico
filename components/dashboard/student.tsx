"use client";
import { useState, useTransition } from "react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink } from "lucide-react";
import PsychologistProfile from "../PsychoProfile";

const DashboardStudent = () => {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [session, setSession] = useState<any>(null)
  const [selectedPsychologist, setSelectedPsychologist] = useState<
    number | null
  >(null);

  const psychologists = (id: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/session/${id}`)
      const data = await res.json()
      setSession(data)
    })
  }
  // if (selectedPsychologist !== null) {
  //   const psychologist = psychologists.find(
  //     (p) => p.id === selectedPsychologist
  //   );
  //   if (psychologist) {
  //     return (
  //       <PsychologistProfile
  //         {...psychologist}
  //         onBack={() => setSelectedPsychologist(null)}
  //       />
  //     );
  //   }
  // }

  return (
    <div className='min-h-screen from-primary-light to-white p-4 md:p-8'>
      <div className='max-w-full mx-auto'>
        <h1 className='text-3xl font-bold text-center mb-8 text-primary-dark'>
          Encontre seu Psicólogo
        </h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {isPending && <p>Carregando...</p>}
          {session && session.map((psych:any) => (
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
                    {psych.specialties.slice(0, 2).map((specialty:any) => (
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

export default DashboardStudent;
