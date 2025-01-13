"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import Layout from "../../components/Layout";
import Calendar from "@/components/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, DollarSign, Home, Users } from "lucide-react";

const DashboardPage = () => {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);

  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.push("/login");
  //   }
  // }, [status, router]);

  useEffect(() => {
    const fetchSummary = async () => {
      //  const students = await api.getStudents();
      // const rooms = await api.getRooms();
      // const supervisors = await api.getSupervisors();
      setSummary({
        studentsCount: 100,
        roomsCount: 20,
        supervisorsCount: 34,
      });
    };
    fetchSummary();
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // if (!session) {
  //   return null;
  // }

  return (
    <>
      <h1 className='text-2xl font-bold mb-4 text-primary'>Dashboard</h1>
      {/* <p className='mb-4 text-accent'>Bem-vindo, {session.user?.name}!</p> */}
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
            {/* <div className='text-2xl font-bold'>
              {summary ? `R$ ${summary?.pendingPayments.toFixed(2)}` : "..."}
            </div> */}
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

export default DashboardPage;
