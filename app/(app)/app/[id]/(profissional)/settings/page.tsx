// components/SettingsScreen.tsx
"use client"
import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaFileMedical, FaUserMd, FaClinicMedical, FaStethoscope, FaCog } from "react-icons/fa"
import { useCurrentUser } from "@hooks/use-current-user"

interface SettingsCardProps {
  title: string
  description: string
  icon: JSX.Element
  href: string
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, description, icon, href }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={href}
      className="relative bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      style={{ transitionDelay: `50ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 hover:opacity-10 transition-opacity duration-300"></div>

      <div className="p-6">
        <div className="flex items-center mb-4">
          <div
            className={`p-3 rounded-full ${
              isHovered ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
            } transition-colors duration-300`}
          >
            {icon}
          </div>
          <h3 className="ml-4 text-xl font-bold text-gray-800">{title}</h3>
        </div>

        <p className="text-gray-600">{description}</p>

        <div className="mt-4 flex justify-end">
          <span className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            Configurar →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState("settings")
  const user = useCurrentUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-bold mb-8 text-gray-800">Configurações do Sistema</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* <SettingsCard
                title="Atestado Médico"
                description="Configure o modelo de atestado médico, incluindo logo, rodapé e campos personalizados"
                icon={<FaFileMedical className="text-2xl" />}
                href="./settings/atestado"
              /> */}

              <SettingsCard
                title="Perfil do Profissional"
                description="Gerencie suas informações profissionais, especialidades e horários de atendimento"
                icon={<FaUserMd className="text-2xl" />}
                href={`/app/professional/${user?.id}/profile`}
              />

              <SettingsCard
                title="Endereço de Atendimento"
                description="Configure informações do endereço de atendimento"
                icon={<FaClinicMedical className="text-2xl" />}
                href="./settings/address/clinic"
              />

              <SettingsCard
                title="Modelos de Documentos"
                description="Crie e gerencie modelos de documentos personalizados para diferentes tipos de atestados"
                icon={<FaFileMedical className="text-2xl" />}
                href="./settings/atestado"
              />

              {/* <SettingsCard
                title="Integrações"
                description="Conecte sua conta com outros sistemas e plataformas de saúde"
                icon={<FaStethoscope className="text-2xl" />}
                href="/settings/integrations"
              /> */}

              {/* <SettingsCard
                title="Configurações Gerais"
                description="Ajustes de sistema, notificações e preferências de uso"
                icon={<FaCog className="text-2xl" />}
                href="/settings/general"
              /> */}
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Configurações da Conta</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600">Configurações da conta em desenvolvimento...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
