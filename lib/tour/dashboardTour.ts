import { driver, DriveStep, Config } from "driver.js"
import "driver.js/dist/driver.css"

export interface TourStep extends DriveStep {
    element: string
    popover: {
        title: string
        description: string
        side?: "top" | "right" | "bottom" | "left"
        align?: "start" | "center" | "end"
    }
}

export const dashboardTourSteps: TourStep[] = [
    {
        element: "#sidebar-navigation",
        popover: {
            title: "Menu de Navegação",
            description: "Use este menu para navegar entre as diferentes seções do sistema: Dashboard, Agenda, Pacientes e mais.",
            side: "right",
            align: "start"
        }
    },
    {
        element: "#agenda-menu-item",
        popover: {
            title: "Agenda",
            description: "Gerencie seus horários, visualize consultas agendadas e organize sua rotina de atendimentos.",
            side: "right"
        }
    },
    {
        element: "#patients-menu-item",
        popover: {
            title: "Pacientes",
            description: "Acesse a lista completa de seus pacientes, adicione novos pacientes e gerencie informações.",
            side: "right"
        }
    },
    {
        element: "#profile-menu-item",
        popover: {
            title: "Perfil Profissional",
            description: "Configure suas informações profissionais, especialidades, valores e disponibilidade.",
            side: "right"
        }
    },
    {
        element: "#notifications-icon",
        popover: {
            title: "Notificações",
            description: "Receba alertas sobre novos agendamentos, mensagens de pacientes e lembretes importantes.",
            side: "bottom"
        }
    },
    {
        element: "#user-menu",
        popover: {
            title: "Menu do Usuário",
            description: "Acesse configurações da conta, ajustes do sistema e faça logout quando necessário.",
            side: "bottom",
            align: "end"
        }
    }
]

export const tourConfig: Config = {
    showProgress: true,
    showButtons: ["next", "previous", "close"],
    nextBtnText: "Próximo",
    prevBtnText: "Anterior",
    doneBtnText: "Concluir",
    progressText: "{{current}} de {{total}}",
    overlayColor: "rgba(0, 0, 0, 0.75)",
    smoothScroll: true,
    animate: true,
    popoverClass: "therapy-tour-popover",
    onDestroyStarted: () => {
        // Salvar que o tour foi concluído
        if (typeof window !== "undefined") {
            localStorage.setItem("tour_dashboard_completed", "true")
        }
    }
}

export function createDashboardTour() {
    return driver({
        ...tourConfig,
        steps: dashboardTourSteps
    })
}
