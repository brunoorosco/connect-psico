import { auth } from "@/auth"
import {
  Calendar,
  Home,
  CalendarClock,
  LogOut,
  FilePieChartIcon,
  MessageCircle,
  CalendarDaysIcon,
  Users,
  WebcamIcon,
  ShieldCheckIcon,
  Settings2Icon,
  StarIcon,
  InfoIcon,
  Search,
  DollarSign,
  ClipboardEdit,
} from "lucide-react"

const useDynamicMenus = async () => {
  const session = await auth()

  const userId = session?.user?.id
  const updatedMenus = menus.map((menu) => {
    return {
      ...menu,
      url: menu.url.replace(/userId/g, `${userId}`),
    }
  })

  return updatedMenus
}

export default useDynamicMenus

export const menus = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
    rules: ["ADMIN"],
  },
  {
    title: "Dashboard do Supervisores",
    url: "/app/professional",
    icon: Home,
    rules: ["ADMIN"],
  },
  {
    title: "Dashboard do Estudantes",
    url: "/app/professional/{userId}/pacientes",
    icon: Users,
    rules: ["ADMIN"],
  },
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
    rules: ["SUPERVISOR"],
  },
  {
    title: "Pacientes",
    url: "/app/professional/{userId}/pacientes",
    icon: Users,
    rules: ["SUPERVISOR"],
  },
  {
    title: "Chat",
    url: `/app/{userId}/chat`,
    icon: MessageCircle,
    rules: ["SUPERVISOR"],
  },
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
    rules: ["DEFAULT"],
  },
  {
    title: "Encontrar Terapeuta",
    url: "/terapeutas",
    icon: Search,
    rules: ["DEFAULT"],
  },
  {
    title: "Chat",
    url: `/app/{userId}/chat`,
    icon: MessageCircle,
    rules: ["DEFAULT"],
  },
  {
    title: "Video Chamada",
    url: `/app/{userId}/videochamada`,
    icon: WebcamIcon,
    rules: ["SUPERVISOR", "DEFAULT"],
  },

  {
    title: "Agendamentos",
    url: `/app/professional/{userId}/agendamentos`,
    icon: CalendarDaysIcon,
    rules: ["SUPERVISOR"],
  },
  {
    title: "Disponibilidade",
    url: `/app/professional/{userId}/disponibilidade`,
    icon: CalendarClock,
    rules: ["SUPERVISOR"],
  },
  {
    title: "Relatório",
    url: `/app/professional/{userId}/report`,
    icon: FilePieChartIcon,
    rules: ["SUPERVISOR"],
  },
  {
    title: "Configurações",
    url: `/app/{userId}/settings`,
    icon: Settings2Icon,
    rules: ["SUPERVISOR"],
  },
  {
    title: "Ajuda",
    url: `/app/{userId}/help-center`,
    icon: InfoIcon,
    rules: ["SUPERVISOR"],
  },
  {
    title: "Pagamentos",
    url: `/app/{userId}/payments`,
    icon: DollarSign,
    rules: ["DEFAULT"],
  },
  {
    title: "Anamenese",
    url: `/app/{userId}/anamenese`,
    icon: ClipboardEdit,
    rules: ["DEFAULT"],
  },
  {
    title: "Comentários",
    url: `/app/{userId}/reviews`,
    icon: StarIcon,
    rules: ["DEFAULT"],
  },
  {
    title: "Permissão",
    url: "/app/admin/permitions",
    icon: ShieldCheckIcon,
    rules: ["ADMIN"],
  },
  {
    title: "Salas",
    url: "/rooms",
    icon: Calendar,
    rules: ["ADMIN"],
  },
]

export const menusFooter = {
  title: "Sair",
  url: "/auth/logout",
  icon: LogOut,
}
