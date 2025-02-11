import logoSvg from "@/assets/logo.png";
import Image from "next/image";

export default function Logo() {
  return <Image src={logoSvg} alt='Logotipo' height={50} />;
}
