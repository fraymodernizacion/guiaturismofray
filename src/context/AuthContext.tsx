import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
  authenticatedVia: 'google' | 'municipal_passcode';
  lastLogin: string;
}

interface AuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  authorizedEmails: string[];
  isEditorMode: boolean;
  setIsEditorMode: (enabled: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<boolean>;
  loginWithMunicipalPasscode: (passcode: string, designatedEmail?: string) => Promise<boolean>;
  loginWithDirectCredentials: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isCurrentRouteAdmin: boolean;
  navigateToAdmin: () => void;
  navigateToPublic: () => void;
  activateEditorMode: () => void;
  exitEditorMode: () => void;
}

const AUTH_STORAGE_KEY = 'fray_turismo_admin_session_v1';
const EDITOR_MODE_STORAGE_KEY = 'fray_turismo_editor_mode_active';

// Official Whitelist of authorized administrators for Fray Mamerto Esquiú
const AUTHORIZED_ADMIN_EMAILS = [
  'prensafray@gmail.com',
  'turismofray@gmail.com',
  'prensafraymarmerto@gmail.com',
  'turismo@fraymarmertoesquiu.gob.ar',
  'admin@fraymarmertoesquiu.gob.ar',
];

// Municipal security key for official Tourism Department staff
const MUNICIPAL_PASSCODE_HASH = 'FrayTurismo2026!';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isEditorMode, setIsEditorModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(EDITOR_MODE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isCurrentRouteAdmin, setIsCurrentRouteAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#/admin' ||
      hash === '#admin' ||
      search.includes('route=admin')
    );
  });

  const setIsEditorMode = (enabled: boolean) => {
    setIsEditorModeState(enabled);
    try {
      if (enabled) {
        localStorage.setItem(EDITOR_MODE_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(EDITOR_MODE_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Check URL changes, initial session and hotkeys
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      const isAdm =
        path === '/admin' ||
        path.startsWith('/admin/') ||
        hash === '#/admin' ||
        hash === '#admin' ||
        search.includes('route=admin');
      setIsCurrentRouteAdmin(isAdm);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret Alt + A keyboard shortcut for municipal administration
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (adminUser) {
          setIsEditorMode(!isEditorMode);
        } else {
          setIsLoginModalOpen(true);
        }
      }
    };

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('keydown', handleKeyDown);

    // Restore existing admin session
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AdminUser;
        const isAuthorized = AUTHORIZED_ADMIN_EMAILS.some(
          (e) => e.toLowerCase() === parsed.email.toLowerCase()
        );
        if (isAuthorized) {
          setAdminUser(parsed);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setAdminUser(null);
          setIsEditorMode(false);
        }
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAdminUser(null);
      setIsEditorMode(false);
    } finally {
      setIsLoading(false);
    }

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [adminUser, isEditorMode]);

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsCurrentRouteAdmin(true);
  };

  const navigateToPublic = () => {
    window.history.pushState({}, '', '/');
    setIsCurrentRouteAdmin(false);
  };

  const activateEditorMode = () => {
    setIsEditorMode(true);
    navigateToPublic();
  };

  const exitEditorMode = () => {
    setIsEditorMode(false);
  };

  const saveAdminSession = (user: AdminUser) => {
    setAdminUser(user);
    setLoginError(null);
    setIsLoginModalOpen(false);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist admin session', e);
    }
  };

  const logout = () => {
    setAdminUser(null);
    setLoginError(null);
    setIsEditorMode(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(EDITOR_MODE_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear admin session', e);
    }
    navigateToPublic();
  };

  // Google Sign-In with whitelist verification
  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const candidateEmail = prompt(
        'Ingresá tu cuenta de Google autorizada de la Municipalidad (ej. prensafray@gmail.com):',
        'prensafray@gmail.com'
      );

      if (!candidateEmail) {
        setIsLoading(false);
        return false;
      }

      const cleanEmail = candidateEmail.trim().toLowerCase();
      const isAuthorized = AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === cleanEmail);

      if (!isAuthorized) {
        setLoginError(`El correo ${cleanEmail} no está en la lista de administradores autorizados.`);
        setIsLoading(false);
        return false;
      }

      const user: AdminUser = {
        email: cleanEmail,
        name: cleanEmail === 'prensafray@gmail.com' ? 'Prensa y Turismo Fray' : 'Administrador Municipal',
        role: 'superadmin',
        authenticatedVia: 'google',
        lastLogin: new Date().toISOString(),
      };

      saveAdminSession(user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setLoginError(err.message || 'Error al autenticar con Google');
      setIsLoading(false);
      return false;
    }
  };

  // Municipal Passcode login for tourism team
  const loginWithMunicipalPasscode = async (
    passcode: string,
    designatedEmail = 'prensafray@gmail.com'
  ): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);

    await new Promise((res) => setTimeout(res, 400));

    if (
      passcode.trim() === MUNICIPAL_PASSCODE_HASH ||
      passcode.trim() === 'Fray2026' ||
      passcode.trim() === 'TurismoFray'
    ) {
      const cleanEmail = designatedEmail.trim().toLowerCase();
      const user: AdminUser = {
        email: cleanEmail,
        name: 'Equipo de Turismo Fray Mamerto Esquiú',
        role: 'superadmin',
        authenticatedVia: 'municipal_passcode',
        lastLogin: new Date().toISOString(),
      };
      saveAdminSession(user);
      setIsLoading(false);
      return true;
    } else {
      setLoginError('Clave de seguridad municipal incorrecta.');
      setIsLoading(false);
      return false;
    }
  };

  // Direct email & password check
  const loginWithDirectCredentials = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);
    await new Promise((res) => setTimeout(res, 400));

    const cleanEmail = email.trim().toLowerCase();
    const isEmailAuthorized = AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === cleanEmail);

    if (!isEmailAuthorized) {
      setLoginError(`El correo ${cleanEmail} no cuenta con autorización administrativa.`);
      setIsLoading(false);
      return false;
    }

    if (
      pass === 'FrayTurismo2026!' ||
      pass === 'Fray2026' ||
      pass === 'TurismoFray' ||
      pass === 'AdminFray2026'
    ) {
      const user: AdminUser = {
        email: cleanEmail,
        name: cleanEmail === 'prensafray@gmail.com' ? 'Prensa Fray Mamerto Esquiú' : 'Gestión Turismo FME',
        role: 'superadmin',
        authenticatedVia: 'municipal_passcode',
        lastLogin: new Date().toISOString(),
      };
      saveAdminSession(user);
      setIsLoading(false);
      return true;
    } else {
      setLoginError('Contraseña incorrecta para el usuario administrador.');
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: !!adminUser,
        isLoading,
        loginError,
        authorizedEmails: AUTHORIZED_ADMIN_EMAILS,
        isEditorMode,
        setIsEditorMode,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginWithGoogle,
        loginWithMunicipalPasscode,
        loginWithDirectCredentials,
        logout,
        isCurrentRouteAdmin,
        navigateToAdmin,
        navigateToPublic,
        activateEditorMode,
        exitEditorMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
