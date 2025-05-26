import { auth } from "@/auth";
import {
  Calendar,
  Home,
  Inbox,
  Settings,
  LogOut,
  GraduationCap,
  User,
  MessageCircle,
  CalendarDaysIcon
} from "lucide-react";

const useDynamicMenus = async () => {
  const session = await auth();

  const userId = session?.user?.id;
  const updatedMenus = menus.map((menu) => {
      return {
        ...menu,
        url: menu.url.replace(/userId/g,`${userId}`),
      };
  });

  return updatedMenus;
};

export default useDynamicMenus;

export const menus = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
    rules: ["ADMIN"],
  },
  {
    title: "Dashboard do Supervisores",
    url: "/dashboard/professional",
    icon: Inbox,
    rules: ["ADMIN"],
  },
  {
    title: "Dashboard do Estudantes",
    url: "/dashboard/professional/{userId}/pacientes",
    icon: GraduationCap,
    rules: ["ADMIN"],
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Inbox,
    rules: ["SUPERVISOR"],
  },
  {
    title: "Pacientes",
    url: "/dashboard",
    icon: Inbox,
    rules: ["SUPERVISOR"],
  },
  {
    title: "Chat",
    url: `/dashboard/professional/{userId}/chat`,
    icon: MessageCircle,
    rules: ["SUPERVISOR"],
  },
  {
    title: "Agendamentos",
    url: `/dashboard/professional/{userId}/agendamentos`,
    icon: CalendarDaysIcon,
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
    url: "/dashboard",
    icon: GraduationCap,
    rules: ["DEFAULT"],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export const menusFooter = {
  title: "Sair",
  url: "/auth/logout",
  icon: LogOut,
};
