import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

export interface AdminUser {
  email: string;
  name: string;
  uid?: string;
  role: 'superadmin' | 'editor';
  authenticatedVia: 'google' | 'municipal_passcode';
  lastLogin: string;
}

interface AuthContextType {
  adminUser: AdminUser | null;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
  getAuthToken: () => Promise<string | null>;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  // Held strictly in React memory (never written to localStorage/sessionStorage)
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const adminTokenRef = useRef<string | null>(null);
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

  useEffect(() => {
    adminTokenRef.current = adminToken;
  }, [adminToken]);

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

  const setIsEditorMode = useCallback((enabled: boolean) => {
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
  }, []);

  const saveAdminSession = useCallback((user: AdminUser) => {
    setAdminUser(user);
    setLoginError(null);
    setIsLoginModalOpen(false);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist admin session', e);
    }
  }, []);

  const syncFirebaseUserToServer = useCallback(async (idToken: string) => {
    try {
      await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${idToken}` },
        cache: 'no-store',
      });
    } catch {
      // Non-fatal sync
    }
  }, []);

  // Retrieve a live Bearer token from Firebase Auth (auto-refreshed) or in-memory municipal session
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      if (auth.currentUser) {
        const freshToken = await auth.currentUser.getIdToken();
        setAdminToken(freshToken);
        adminTokenRef.current = freshToken;
        return freshToken;
      }
    } catch (err) {
      console.warn('[AUTH] Could not refresh Firebase ID token:', err);
    }
    return adminTokenRef.current;
  }, []);

  // Listen to Firebase Auth state (primary authentication source)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        const cleanEmail = fbUser.email.trim().toLowerCase();
        const isAuthorized = AUTHORIZED_ADMIN_EMAILS.some(
          (e) => e.toLowerCase() === cleanEmail
        );
        if (isAuthorized) {
          try {
            const idToken = await fbUser.getIdToken();
            setAdminToken(idToken);
            adminTokenRef.current = idToken;
            const user: AdminUser = {
              email: cleanEmail,
              name:
                fbUser.displayName ||
                (cleanEmail === 'prensafray@gmail.com'
                  ? 'Prensa y Turismo Fray'
                  : 'Administrador Municipal'),
              uid: fbUser.uid,
              role: 'superadmin',
              authenticatedVia: 'google',
              lastLogin: new Date().toISOString(),
            };
            setAdminUser(user);
            try {
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
            } catch {
              // Ignore storage errors
            }
            void syncFirebaseUserToServer(idToken);
          } catch (err) {
            console.warn('[AUTH] Error getting Firebase ID token:', err);
          }
        } else {
          await signOut(auth).catch(() => {});
          setAdminToken(null);
          adminTokenRef.current = null;
        }
        setIsLoading(false);
        return;
      }

      // If no active Firebase user, restore local UI display metadata if present
      // (mutations still require an active verified token)
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
    });

    return () => unsubscribe();
  }, [setIsEditorMode, syncFirebaseUserToServer]);

  // Check URL changes and Alt+A keyboard shortcut
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
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (adminUser && adminTokenRef.current) {
          setIsEditorMode(!isEditorMode);
        } else {
          setIsLoginModalOpen(true);
        }
      }
    };

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [adminUser, isEditorMode, setIsEditorMode]);

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

  const logout = () => {
    void signOut(auth).catch(() => {});
    setAdminUser(null);
    setAdminToken(null);
    adminTokenRef.current = null;
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

  // Primary Authentication: Real Firebase Google Sign-In (signInWithPopup)
  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;
      const cleanEmail = (fbUser.email || '').trim().toLowerCase();

      const isAuthorized = AUTHORIZED_ADMIN_EMAILS.some(
        (e) => e.toLowerCase() === cleanEmail
      );

      if (!isAuthorized) {
        await signOut(auth).catch(() => {});
        setLoginError(
          `El correo ${cleanEmail || 'seleccionado'} no está en la lista de administradores autorizados.`
        );
        setIsLoading(false);
        return false;
      }

      const idToken = await fbUser.getIdToken();
      setAdminToken(idToken);
      adminTokenRef.current = idToken;

      const user: AdminUser = {
        email: cleanEmail,
        name:
          fbUser.displayName ||
          (cleanEmail === 'prensafray@gmail.com'
            ? 'Prensa y Turismo Fray'
            : 'Administrador Municipal'),
        uid: fbUser.uid,
        role: 'superadmin',
        authenticatedVia: 'google',
        lastLogin: new Date().toISOString(),
      };

      saveAdminSession(user);
      void syncFirebaseUserToServer(idToken);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setLoginError('Se canceló el inicio de sesión con Google.');
      } else if (code === 'auth/popup-blocked') {
        setLoginError('El navegador bloqueó la ventana emergente de Google. Permití pop-ups e intentá de nuevo.');
      } else {
        setLoginError(err?.message || 'Error al autenticar con Google.');
      }
      setIsLoading(false);
      return false;
    }
  };

  // Server-verified municipal passcode session (no hardcoded client passwords)
  const authenticateWithServerPasscode = async (
    email: string,
    passcode: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = passcode.trim();

    if (!AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === cleanEmail)) {
      setLoginError(`El correo ${cleanEmail} no cuenta con autorización administrativa.`);
      setIsLoading(false);
      return false;
    }

    try {
      let res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, passcode: cleanPass }),
      });

      if (res.status === 428) {
        // First-time claim if passcode not yet configured on server
        res = await fetch('/api/admin/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, passcode: cleanPass }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.token !== 'string') {
        setLoginError(data.error || 'Clave de seguridad municipal incorrecta.');
        setIsLoading(false);
        return false;
      }

      setAdminToken(data.token);
      adminTokenRef.current = data.token;
      const user: AdminUser = {
        email: cleanEmail,
        name:
          cleanEmail === 'prensafray@gmail.com'
            ? 'Prensa Fray Mamerto Esquiú'
            : 'Gestión Turismo FME',
        role: 'superadmin',
        authenticatedVia: 'municipal_passcode',
        lastLogin: new Date().toISOString(),
      };
      saveAdminSession(user);
      setIsLoading(false);
      return true;
    } catch {
      setLoginError('Error de conexión con el servidor al validar credenciales.');
      setIsLoading(false);
      return false;
    }
  };

  const loginWithMunicipalPasscode = async (
    passcode: string,
    designatedEmail = 'prensafray@gmail.com'
  ): Promise<boolean> => {
    return authenticateWithServerPasscode(designatedEmail, passcode);
  };

  const loginWithDirectCredentials = async (
    email: string,
    pass: string
  ): Promise<boolean> => {
    return authenticateWithServerPasscode(email, pass);
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        adminToken,
        setAdminToken,
        getAuthToken,
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
