import { auth } from "@/auth";
import RegisterForm from "@/components/auth/register-form";
import Navbar from "@/components/layout/Navbar";
import { redirect } from "next/navigation";

const Login = async () => {
  const session = await auth();
  if (session) {
    redirect("/app");
  }
  return (
    <>
    <Navbar/>
    <div className='mt-16'>
      <RegisterForm />
    </div>
    </>
  );
};

export default Login;
