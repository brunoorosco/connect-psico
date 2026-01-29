import { useState } from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/auth/logout-button';
import Button from '@/components/shared/Button';

type NavbarProps = {
  userLoggedIn: boolean;
};

const ButtonsNavbar = ({ userLoggedIn }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderLoggedInMenu = () => (
    <>
      <Button variant="outline" size="sm" className=''>
        <Link href="/app" className="text-therapy-purple-primary hover:text-primary transition-all-200">
          Dashboard
        </Link>
      </Button>
      <Button variant="primary" size="sm">
        <LogoutButton>Sair</LogoutButton>
      </Button>
    </>
  );

  const renderLoggedOutMenu = () => (
    <>
      <Link href="/auth/login">
        <Button variant="outline" size="sm">Entrar</Button>
      </Link>
      <Link href="/auth/signup">
        <Button variant="primary" size="sm">Registra-se</Button>
      </Link>
    </>
  );

  return (
    <div>
      {userLoggedIn ? renderLoggedInMenu() : renderLoggedOutMenu()}
    </div>
  );
};

export default ButtonsNavbar;
