import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { applyTheme, getTheme, type UserRole } from '@/lib/theme';

/**
 * Hook pour gérer le thème basé sur le rôle utilisateur
 */
export function useTheme() {
  const { user } = useAuth();
  
  // Détermine le rôle basé sur l'utilisateur connecté
  const getUserRole = (): UserRole => {
    if (!user) return 'customer';
    return user.role === 'manager' ? 'manager' : 'customer';
  };
  
  const currentRole = getUserRole();
  const currentTheme = getTheme(currentRole);
  
  // Applique le thème à chaque changement d'utilisateur
  useEffect(() => {
    applyTheme(currentRole);
  }, [currentRole]);
  
  return {
    role: currentRole,
    theme: currentTheme,
    applyTheme: (role: UserRole) => applyTheme(role),
  };
}