import { auth } from "@/auth";
import LoginForm from "@/components/auth/login-form";
import Navbar1 from "@/components/layout/Navbar";
import { redirect } from "next/navigation";

const Login = async () => {
  const session = await auth();
  if (session) {
    redirect("/app");
  }
  return (
    <>
      <Navbar1 />
      <div className="mt-16"> 
        <LoginForm/>
      </div>
    </>
  );
};

export default Login;
