// import React, { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { format, parse } from 'date-fns';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { Check, ChevronsUpDown } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { toast } from '@/components/ui/use-toast';
// import { User } from '@/domain/model/user';
// import { Appointment } from '@/domain/model/appointment';

// const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

// const appointmentSchema = z.object({
//   patientId: z.string().min(1, "Selecione um paciente"),
//   date: z.string().min(1, "Selecione uma data"),
//   startTime: z.string().regex(TIME_REGEX, "Formato inválido. Use HH:MM"),
//   endTime: z.string().regex(TIME_REGEX, "Formato inválido. Use HH:MM"),
//   notes: z.string().optional(),
// });

// type AppointmentFormValues = z.infer<typeof appointmentSchema>;

// interface AppointmentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (appointment: Appointment) => void;
//   selectedDate: Date;
//   editingAppointment: Appointment | null;
// }

// const AppointmentModal: React.FC<AppointmentModalProps> = ({
//   isOpen,
//   onClose,
//   onSave,
//   selectedDate,
//   editingAppointment
// }) => {
//   const [patients, setPatients] = useState<User[]>(mockPatients);
//   const [patientOpen, setPatientOpen] = useState(false);

//   const form = useForm<AppointmentFormValues>({
//     resolver: zodResolver(appointmentSchema),
//     defaultValues: {
//       patientId: '',
//       date: format(selectedDate, 'yyyy-MM-dd'),
//       startTime: '09:00',
//       endTime: '09:30',
//       notes: '',
//     },
//   });

//   // Update form when editing an appointment
//   useEffect(() => {
//     if (editingAppointment) {
//       form.reset({
//         patientId: editingAppointment.patientId,
//         date: editingAppointment.date,
//         startTime: editingAppointment.startTime,
//         endTime: editingAppointment.endTime,
//         notes: editingAppointment.notes || '',
//       });
//     } else {
//       form.reset({
//         patientId: '',
//         date: format(selectedDate, 'yyyy-MM-dd'),
//         startTime: '09:00',
//         endTime: '09:30',
//         notes: '',
//       });
//     }
//   }, [editingAppointment, selectedDate, form]);

//   const handleSubmit = (values: AppointmentFormValues) => {
//     const selectedPatient = patients.find(p => p.id === values.patientId) ||
//                            patients.find(p => p.id === values.patientId);

//     if (!selectedPatient) {
//       toast({
//         title: "Erro",
//         description: "Paciente não encontrado",
//         variant: "destructive"
//       });
//       return;
//     }

//     const newAppointment: Appointment = {
//       id: editingAppointment?.id || `a${Date.now()}`,
//       patientId: selectedPatient.id as string,
//       patientName: selectedPatient.name,
//       date: values.date,
//       startTime: values.startTime,
//       endTime: values.endTime,
//       notes: values.notes,
//       isLinkedToMedicalRecord: false
//     };

//     onSave(newAppointment);
//     onClose();
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle>{editingAppointment ? 'Editar Consulta' : 'Nova Consulta'}</DialogTitle>
//           <DialogDescription>
//             {editingAppointment
//               ? 'Faça alterações nas informações da consulta abaixo'
//               : 'Preencha as informações para agendar uma nova consulta'
//             }
//           </DialogDescription>
//         </DialogHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="patientId"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>Paciente</FormLabel>
//                   <Popover open={patientOpen} onOpenChange={setPatientOpen}>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant="outline"
//                           role="combobox"
//                           aria-expanded={patientOpen}
//                           className={cn(
//                             "w-full justify-between",
//                             !field.value && "text-muted-foreground"
//                           )}
//                         >
//                           {field.value
//                             ? patients.find(
//                                 (patient) => patient.id === field.value
//                               )?.name
//                             : "Selecione um paciente"}
//                           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-[400px] p-0">
//                       <Command>
//                         <CommandInput placeholder="Buscar paciente..." />
//                         <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
//                         <CommandGroup>
//                           {patients.map((patient) => (
//                             <CommandItem
//                               key={patient.id}
//                               value={patient.id}
//                               onSelect={() => {
//                                 form.setValue("patientId", patient.id as string);
//                                 setPatientOpen(false);
//                               }}
//                             >
//                               <Check
//                                 className={cn(
//                                   "mr-2 h-4 w-4",
//                                   patient.id === field.value
//                                     ? "opacity-100"
//                                     : "opacity-0"
//                                 )}
//                               />
//                               <div className="flex flex-col">
//                                 <span>{patient.name}</span>
//                                 <span className="text-xs text-muted-foreground">
//                                   {/* {patient.medicalRecordId
//                                     ? `Prontuário: ${patient.medicalRecordId}`
//                                     : "Sem prontuário vinculado"} */}
//                                 </span>
//                               </div>
//                             </CommandItem>
//                           ))}
//                         </CommandGroup>
//                       </Command>
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="date"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Data</FormLabel>
//                   <FormControl>
//                     <Input type="date" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="startTime"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Horário de Início</FormLabel>
//                     <FormControl>
//                       <Input type="time" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="endTime"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Horário de Término</FormLabel>
//                     <FormControl>
//                       <Input type="time" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Observações</FormLabel>
//                   <FormControl>
//                     <Textarea {...field} />
//                   </FormControl>
//                   <FormDescription>
//                     Informações adicionais sobre a consulta.
//                   </FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={onClose}>
//                 Cancelar
//               </Button>
//               <Button type="submit">
//                 {editingAppointment ? 'Salvar Alterações' : 'Agendar Consulta'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AppointmentModal;

const Index = () => {
  return (
    <div className="min-h-screen from-primary-light to-white p-4 md:p-8">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary-dark">Pacientes</h1>
      </div>
    </div>
  );
};

export default Index;
