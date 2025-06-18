"use client"

import React, { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Clock, Calendar, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Mock data for AI-generated summary
const mockSummary = [
  "Paciente tem demonstrado progresso constante nas últimas sessões.",
  "Melhorias notáveis na capacidade de lidar com situações de estresse no ambiente de trabalho.",
  "Aplicação consistente das técnicas de mindfulness ensinadas nas sessões anteriores.",
  "Redução significativa nos episódios de ansiedade relatados desde o início do tratamento."
];

// Mock patient data
const mockPatientsData = [
  {
    id: 1,
    name: "Maria Silva",
    age: 35,
    gender: "Feminino",
    diagnosis: "Transtorno de Ansiedade Generalizada"
  },
  {
    id: 2,
    name: "João Oliveira",
    age: 42,
    gender: "Masculino",
    diagnosis: "Depressão Leve"
  },
  {
    id: 3,
    name: "Ana Santos",
    age: 28,
    gender: "Feminino"
  },
];

const ConsultationStart: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = parseInt(searchParams?.get("patientId") ?? "1");
  
  const [patient, setPatient] = useState(mockPatientsData[0]);
  const [consultationDate, setConsultationDate] = useState(new Date());
  const [consultationTime, setConsultationTime] = useState("14:00");
  const [clinicalEvolution, setClinicalEvolution] = useState("");
  const [prescription, setPrescription] = useState("");
  const [isEditingDateTime, setIsEditingDateTime] = useState(false);

  // Find patient data based on patientId from URL
  useEffect(() => {
    const foundPatient = mockPatientsData.find(p => p.id === patientId);
    if (foundPatient) {
      setPatient(foundPatient);
    }
  }, [patientId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleSaveConsultation = () => {
    // Here would be the logic to save consultation data
    console.log("Salvando consulta:", {
      patientId,
      consultationDate,
      consultationTime,
      clinicalEvolution,
      prescription
    });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            onClick={handleGoBack} 
            variant="ghost" 
            size="sm"
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Consulta em Andamento</h1>
        </div>

        {/* Patient Header */}
        <Card className="mb-6 border-l-4 border-therapy-primary">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <h2 className="font-bold text-xl text-therapy-tertiary">{patient.name}</h2>
                <div className="text-sm text-gray-500">
                  {patient.age} anos • {patient.gender}
                  {patient.diagnosis && <> • <span className="font-medium">{patient.diagnosis}</span></>}
                </div>
              </div>
              
              <div className={`mt-3 sm:mt-0 flex items-center ${isEditingDateTime ? 'flex-col sm:flex-row gap-2' : ''}`}>
                {!isEditingDateTime ? (
                  <div className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-therapy-primary" />
                    <span>{format(consultationDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1 text-therapy-primary" />
                    <span>{consultationTime}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingDateTime(true)}
                      className="ml-2 h-7 text-therapy-tertiary hover:text-therapy-primary"
                    >
                      Editar
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "justify-start text-left font-normal",
                            )}
                            size="sm"
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(consultationDate, "dd/MM/yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={consultationDate}
                            onSelect={(date) => setConsultationDate(date || new Date())}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>

                      <Input 
                        type="time"
                        value={consultationTime}
                        onChange={(e) => setConsultationTime(e.target.value)}
                        className="w-24"
                      />

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditingDateTime(false)}
                      >
                        Confirmar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Summary */}
        <Card className="mb-6 therapy-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-therapy-tertiary flex items-center">
              <File className="h-4 w-4 mr-2" />
              Resumo IA - Evolução do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-therapy-light/30 p-3 rounded-lg text-sm">
              <ul className="list-disc list-inside space-y-1">
                {mockSummary.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Evolution */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-therapy-tertiary">
              Evolução Clínica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Digite suas observações sobre a consulta atual..."
              className="min-h-[150px]"
              value={clinicalEvolution}
              onChange={(e) => setClinicalEvolution(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Prescription */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-therapy-tertiary">
              Receituário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Digite as recomendações e receitas se necessário..."
              className="min-h-[100px]"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end mt-4 gap-3">
          <Button 
            variant="outline" 
            onClick={handleGoBack}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveConsultation}
            className="bg-therapy-primary hover:bg-therapy-tertiary transition-colors"
          >
            Finalizar Consulta
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ConsultationStart;
