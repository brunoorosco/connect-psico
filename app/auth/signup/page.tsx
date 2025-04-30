import { auth } from "@/auth";
import RegisterForm from "@/components/auth/register-form";
import { redirect } from "next/navigation";

const Login = async () => {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className='flex flex-col w-full min-h-full items-center justify-center mt-20'>
      <RegisterForm />
    </div>
  );
};

export default Login;
