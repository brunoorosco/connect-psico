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
    cancelForm,
    backToList,
    setShowForm,
  } = usePatientManager();

  return (
    <div className="container-full bg-gray-50">
      <div className="mx-auto py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-medical">Gerenciamento de Pacientes</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
      </div>

      <main className="mx-auto py-6">
        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingPatient ? 'Editar Paciente' : 'Novo Paciente'}</CardTitle>
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
          />
        )}
      </main>
    </div>
  );
}
