import { auth } from "@/auth";
import DashboardProfessional from "@/components/dashboard/professional";
import DashboardStudent from "@/components/dashboard/student";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <>
      {session?.user.role !== "STUDENT" ? (
        <DashboardStudent />
      ) : (
        <DashboardProfessional />
      )}
    </>
  );
};

export default DashboardPage;
