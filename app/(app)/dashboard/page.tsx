import { auth } from "@/auth";
import DashboardDefault from "@/components/dashboard/DashboardDefault";
import DashboardProfessional from "@/components/dashboard/professional";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <>
    {session?.user.role === "ADMIN" && redirect("/dashboard/admin")}
      {session?.user.role === "SUPERVISOR" ? (
        <DashboardProfessional />
      ) : (
        <DashboardDefault />
      )}
    </>
  );
};

export default DashboardPage;
