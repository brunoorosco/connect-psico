import { auth } from "@/auth"
import {
  Calendar,
  Home,
  CalendarClock,
  LogOut,
  GraduationCap,
  FilePieChartIcon,
  MessageCircle,
  CalendarDaysIcon,
  Users,
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
    url: `/app/professional/{userId}/chat`,
    icon: MessageCircle,
    rules: ["SUPERVISOR"],
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
    title: "Salas",
    url: "/rooms",
    icon: Calendar,
    rules: ["ADMIN"],
  },
  {
    title: "Dashboard",
    url: "/app",
    icon: GraduationCap,
    rules: ["DEFAULT"],
  },
  {
    title: "Chat",
    url: `/app/users/{userId}/chat`,
    icon: MessageCircle,
    rules: ["DEFAULT"],
  },
]

export const menusFooter = {
  title: "Sair",
  url: "/auth/logout",
  icon: LogOut,
}
