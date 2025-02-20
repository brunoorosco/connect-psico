"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MessageCircle,
  Star,
  Clock,
  Award,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { ScheduleModal } from "./ScheduleModal";
import { MessageSheet } from "./MessageSheet";
import { professionalById } from "@/actions/auth/professional";

export type TProfessional = {
  Comentarios: TComentarios[];
  especialidade: string[];
  bio: string;
  experience: string;
  education: string;
  price: string;
  abordagem: string;
};

type TComentarios = {
  id: number;
  author: string;
  content: string;
  rating: number;
};

export type PsychologistProfileProps = {
  name: string;
  image: string;
  professional: TProfessional;
  onBack?: () => void;
};

const PsychologistProfile = ({
  name,
  image,
  professional,
  onBack,
}: PsychologistProfileProps) => {
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [messageSheetOpen, setMessageSheetOpen] = useState(false);

  return (
    <div className='min-h-screen  from-primary-light to-white p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        <Button
          variant='ghost'
          className='mb-6 text-primary hover:text-primary-dark hover:bg-primary/10'
          //   onClick={onBack}
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Voltar para lista
        </Button>

        {/* Quick Info Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in'>
          <Card className='p-4 backdrop-blur-sm bg-card/90 hover:shadow-lg transition-shadow'>
            <div className='flex flex-col items-center text-center'>
              <div className='bg-primary/10 rounded-full p-3 mb-2'>
                <Star className='w-6 h-6 text-primary' />
              </div>
              <h3 className='text-sm font-semibold mb-1'>Avaliação</h3>
              <p className='text-2xl font-bold text-primary'>
                {"calcula a medias das qualificações"}
              </p>
              <p className='text-xs text-gray-600'>
                {/* {professional.Comentarios.length} avaliações */}
              </p>
            </div>
          </Card>

          <Card className='p-4 backdrop-blur-sm bg-card/90 hover:shadow-lg transition-shadow'>
            <div className='flex flex-col items-center text-center'>
              <div className='bg-primary/10 rounded-full p-3 mb-2'>
                <Heart className='w-6 h-6 text-primary' />
              </div>
              <h3 className='text-sm font-semibold mb-1'>Especialidade</h3>
              <p className='text-md font-medium text-primary-dark'>
                {professional.especialidade[0]}
              </p>
              <p className='text-xs text-gray-600'>Principal foco</p>
            </div>
          </Card>

          <Card className='p-4 backdrop-blur-sm bg-card/90 hover:shadow-lg transition-shadow'>
            <div className='flex flex-col items-center text-center'>
              <div className='bg-primary/10 rounded-full p-3 mb-2'>
                <Clock className='w-6 h-6 text-primary' />
              </div>
              <h3 className='text-sm font-semibold mb-1'>Experiência</h3>
              <p className='text-md font-medium text-primary-dark'>
                {professional.experience}
              </p>
              <p className='text-xs text-gray-600'>Tempo de atuação</p>
            </div>
          </Card>

          <Card className='p-4 backdrop-blur-sm bg-card/90 hover:shadow-lg transition-shadow'>
            <div className='flex flex-col items-center text-center'>
              <div className='bg-primary/10 rounded-full p-3 mb-2'>
                <Award className='w-6 h-6 text-primary' />
              </div>
              <h3 className='text-sm font-semibold mb-1'>Valor</h3>
              <p className='text-md font-medium text-primary-dark'>
                {professional.price}
              </p>
              <p className='text-xs text-gray-600'>Por sessão</p>
            </div>
          </Card>
        </div>

        <div className='animate-fade-in'>
          {/* Header Section */}
          <Card className='p-6 mb-6 backdrop-blur-sm bg-card/90 shadow-sm'>
            <div className='flex flex-col md:flex-row items-center gap-6'>
              <div className='relative w-32 h-32 md:w-40 md:h-40'>
                <img
                  src={image}
                  alt={name}
                  className='rounded-full object-cover w-full h-full border-4 border-primary'
                />
                <Badge className='absolute -top-2 -right-2 bg-primary text-white'>
                  <Star className='w-4 h-4 mr-1' />
                  {professional.Comentarios[0].rating}
                </Badge>
              </div>
              <div className='flex-1 text-center md:text-left'>
                <h1 className='text-3xl font-semibold mb-2'>{name}</h1>
                <p className='text-gray-600 mb-4'>{professional.bio}</p>
                <div className='flex flex-wrap gap-2 justify-center md:justify-start'>
                  {professional.especialidade.map((specialty) => (
                    <Badge
                      key={specialty}
                      className='bg-accent text-primary-dark hover:bg-accent-dark'
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <Button
              className='bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-2 h-12'
              size='lg'
              onClick={() => setScheduleModalOpen(true)}
            >
              <Calendar className='w-5 h-5' />
              Agendar Consulta
            </Button>
            <Button
              variant='outline'
              className='border-primary text-primary hover:bg-primary/10 flex items-center justify-center gap-2 h-12'
              size='lg'
              onClick={() => setMessageSheetOpen(true)}
            >
              <MessageCircle className='w-5 h-5' />
              Enviar Mensagem
            </Button>
          </div>

          {/* Info Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <Card className='p-4 backdrop-blur-sm bg-card/90'>
              <Clock className='w-6 h-6 text-primary mb-2' />
              <h3 className='font-semibold mb-1'>Experiência</h3>
              <p className='text-gray-600'>{professional.experience}</p>
            </Card>
            <Card className='p-4 backdrop-blur-sm bg-card/90'>
              <Award className='w-6 h-6 text-primary mb-2' />
              <h3 className='font-semibold mb-1'>Formação</h3>
              <p className='text-gray-600'>{professional.education}</p>
            </Card>
            <Card className='p-4 backdrop-blur-sm bg-card/90'>
              <Heart className='w-6 h-6 text-primary mb-2' />
              <h3 className='font-semibold mb-1'>Valor Consulta</h3>
              <p className='text-gray-600'>{professional.price}</p>
            </Card>
          </div>

          {/* Reviews Section */}
          <Card className='p-6 backdrop-blur-sm bg-card/90'>
            <h2 className='text-2xl font-semibold mb-4'>Depoimentos</h2>
            <div className='space-y-4'>
              {professional.Comentarios.map((review) => (
                <div
                  key={review.id}
                  className='border-b border-gray-100 last:border-0 pb-4 last:pb-0'
                >
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='font-medium'>{review.author}</span>
                    <div className='flex items-center'>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className='w-4 h-4 text-primary fill-primary'
                        />
                      ))}
                    </div>
                  </div>
                  <p className='text-gray-600'>{review.content}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <ScheduleModal
          open={scheduleModalOpen}
          onOpenChange={setScheduleModalOpen}
          psychologistName={name}
        />

        <MessageSheet
          open={messageSheetOpen}
          onOpenChange={setMessageSheetOpen}
          psychologistName={name}
        />
      </div>
    </div>
  );
};

export default PsychologistProfile;
