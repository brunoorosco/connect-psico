import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientHeader } from "./PatientHeader"
import { PatientInfoTab } from "./PatientInfoTab"
import { PatientAppointmentsTab } from "./PatientAppointmentsTab"
import { PatientRecordsTab } from "./PatientRecordsTab"
import { usePatientDetails } from "@hooks/usePatients"
import { IPatientDetails } from "./types"
import { MessageDialog } from "../DialogMessagePatient"

export const PatientDetails: React.FC<IPatientDetails> = ({ patient, onBack, onEdit }) => {
  const { patientAppointments,  handleScheduleAppointment } = usePatientDetails(patient)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const handleSendMessage = () => {
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <PatientHeader
        patient={patient}
        onBack={onBack}
        onEdit={onEdit}
        onSendMessage={handleSendMessage}
        onSchedule={handleScheduleAppointment}
      />

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
          <TabsTrigger value="records">Prontuário</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <PatientInfoTab patient={patient} />
        </TabsContent>

        <TabsContent value="appointments">
          <PatientAppointmentsTab appointments={patientAppointments} />
        </TabsContent>

        <TabsContent value="records">
          <PatientRecordsTab patientId={patient.userId} />
        </TabsContent>
      </Tabs>
        <MessageDialog
        patient={patient}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}

export default PatientDetails
