"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Calendar from "@/components/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, DollarSign, Home, Users } from "lucide-react";

const DashboardProfessional = () => {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setSummary({
        studentsCount: 100,
        roomsCount: 20,
        supervisorsCount: 34,
      });
    };
    fetchSummary();
  }, []);

  return (
    <>
      <h1 className='text-2xl font-bold mb-4 text-primary'>Dashboard</h1>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Supervisores</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary?.supervisorsCount ?? "..."}
            </div>
            <p className='text-xs text-muted-foreground'>
              Total de supervisores registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Estudantes</CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary?.studentsCount ?? "..."}
            </div>
            <p className='text-xs text-muted-foreground'>
              Total de estudantes registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Salas</CardTitle>
            <Home className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary?.roomsCount ?? "..."}
            </div>
            <p className='text-xs text-muted-foreground'>
              Total de salas disponíveis
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pagamentos Pendentes
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <p className='text-xs text-muted-foreground'>
              Total de pagamentos pendentes
            </p>
          </CardContent>
        </Card>
      </div>
      <Calendar title='Calendário' />
    </>
  );
};

export default DashboardProfessional;
