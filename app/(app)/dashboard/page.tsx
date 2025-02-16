import { auth } from "@/auth";
import DashboardProfessional from "@/components/dashboard/professional";
import DashboardStudent from "@/components/dashboard/student";

const DashboardPage = async () => {
  const session = await auth();
  console.log(session);

  return (
    <>
      {session?.user.role !== "SUPERVISOR" ? (
        <DashboardProfessional />
      ) : (
        <DashboardStudent />
      )}
    </>
  );
};

export default DashboardPage;
