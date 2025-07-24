'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PatientForm from '@/components/patients/PatientForm';
import PatientList from '@/components/patients/PatientList';
import { PatientDetails } from '@/components/patients/PatientDetails';
import { usePatientManager } from '@/hooks/usePatientManager';

export function PatientsPage() {
  const {
    patients,
    showForm,
    selectedPatient,
    editingPatient,
    handleAddPatient,
    handleEditPatient,
    handleDeletePatient,
    handleViewPatient,
    handleEditClick,
    handleAppointmentCreate,
    cancelForm,
    backToList,
    setShowForm,
  } = usePatientManager();

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden px-2 py-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Título e botão responsivos */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h1 className="text-2xl font-bold text-medical text-center sm:text-left">
            Gerenciamento de Pacientes
          </h1>
          <div className="flex justify-center sm:justify-end">
            <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2 shrink-0" />
              Novo Paciente
            </Button>
          </div>
        </div>

        {/* Conteúdo principal */}
        <main>
          {showForm ? (
            <Card className="w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PatientForm
                  patient={editingPatient}
                  onSubmit={editingPatient ? handleEditPatient : handleAddPatient}
                  onCancel={cancelForm}
                />
              </CardContent>
            </Card>
          ) : selectedPatient ? (
            <PatientDetails
              patient={selectedPatient}
              onBack={backToList}
              onEdit={() => handleEditClick(selectedPatient)}
            />
          ) : (
            <PatientList
              patients={patients}
              onViewPatient={handleViewPatient}
              onEditPatient={handleEditClick}
              onDeletePatient={handleDeletePatient}
              onAppointmentCreate={handleAppointmentCreate}
            />
          )}
        </main>
      </div>
    </div>
  );
}
