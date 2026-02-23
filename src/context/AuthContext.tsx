import { createContext, useContext, useEffect, useState } from 'react';
import {
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/services/firebase';

export type Role = 'servant' | 'admin';

export interface User {
  uid: string;
  email: string | null;
  role: Role;
  name: string;
  class_id?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseRole = (value: unknown): Role | null => {
  if (value === 'servant' || value === 'admin') {
    return value;
  }
  return null;
};

const parseClassId = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const toAppUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  const tokenResult = await getIdTokenResult(firebaseUser);
  const role = parseRole(tokenResult.claims.role);

  if (!role) {
    return null;
  }

  const classId = parseClassId(tokenResult.claims.class_id);
  const fallbackName = firebaseUser.email?.split('@')[0] ?? 'User';

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    role,
    name: firebaseUser.displayName ?? fallbackName,
    class_id: classId,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const mappedUser = await toAppUser(firebaseUser);
        if (!mappedUser) {
          await signOut(auth);
          setUser(null);
        } else {
          setUser(mappedUser);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const mappedUser = await toAppUser(credential.user);

    if (!mappedUser) {
      await signOut(auth);
      throw new Error('Access denied');
    }

    setUser(mappedUser);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const getAuthToken = async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getAuthToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
