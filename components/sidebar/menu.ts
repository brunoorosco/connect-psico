import { auth } from "@/auth";
import {
  Calendar,
  Home,
  Inbox,
  Settings,
  LogOut,
  GraduationCap,
  User,
} from "lucide-react";

const useDynamicMenus = async () => {
  const session = await auth();

  const userId = session?.user?.id;

  const updatedMenus = menus.map((menu) => {
    if (menu.url.endsWith("/1")) {
      return {
        ...menu,
        url: menu.url.replace("/1", `/${userId}`),
      };
    }
    return menu;
  });

  return updatedMenus;
};

export default useDynamicMenus;
export const menus = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Supervisores",
    url: "/dashboard/professional",
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
    url: "/dashboard/students",
    icon: GraduationCap,
    rules: ["ADMIN", "DEFAULT"],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  {
    title: "Visão Estudantes",
    url: "/students/{userId}",
    icon: GraduationCap,
    rules: ["ADMIN", "DEFAULT"],
  },
  {
    title: "Visão Supervisores",
    url: "/supervisors/{userId}",
    icon: User,
    rules: ["ADMIN", "SUPERVISOR"],
  },
];

export const menusFooter = {
  title: "Sair",
  url: "/auth/logout",
  icon: LogOut,
};
