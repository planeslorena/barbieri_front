'use client';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/context/user.context';
import { logout } from '@/app/services/auth';

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className = '' }: LogoutButtonProps) {
  const router = useRouter();
  const { setUserData } = useContext(UserContext);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setUserData(undefined);
      localStorage.clear();
      sessionStorage.clear();
      router.replace('/auth');
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      className={`logout-btn ${className}`.trim()}
      onClick={handleLogout}
      disabled={loggingOut}
    >
      <i className="bi bi-box-arrow-right" />
      {loggingOut ? 'Cerrando...' : 'Cerrar sesion'}
    </button>
  );
}
