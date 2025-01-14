import {
  Calendar,
  Home,
  Inbox,
  Settings,
  LogOut,
  GraduationCap,
  User,
} from "lucide-react";
export const menus = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Supervisores",
    url: "/supervisors",
    icon: Inbox,
    rules: ["ADMIN", "SUPERVISOR"],
  },
  {
    title: "Salas",
    url: "/rooms",
    icon: Calendar,
    rules: ["ADMIN"],
  },
  {
    title: "Estudantes",
    url: "/students",
    icon: GraduationCap,
    rules: ["ADMIN", "STUDENT"],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  {
    title: "Visão Estudantes",
    url: "/view/students/1",
    icon: GraduationCap,
    rules: ["ADMIN", "STUDENT"],
  },
  {
    title: "Visão Supervisores",
    url: "/view/supervisors/1",
    icon: User,
    rules: ["ADMIN", "SUPERVISOR"],
  },
];

export const menusFooter = {
  title: "Sair",
  url: "/auth/logout",
  icon: LogOut,
};
