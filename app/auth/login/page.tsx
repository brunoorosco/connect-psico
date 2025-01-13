import { auth } from "@/auth";
import LoginForm from "@/components/auth/login-form";
import { redirect } from "next/navigation";

const Login = async () => {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className='flex flex-col w-full min-h-full items-center justify-center'>
      <LoginForm />
    </div>
  );
};

export default Login;
