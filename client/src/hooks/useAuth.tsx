import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { handleAuthRedirect, getCurrentUserToken } from "@/lib/auth";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  token: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          
          // Verify with backend to get/create user
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });
          
          if (response.ok) {
            const { user } = await response.json();
            setUser(user);
          }
          
          // Check if this is a redirect from OAuth
          const authResult = await handleAuthRedirect();
          if (authResult) {
            // If redirect happened, update user but don't duplicate
            if (!user) {
              setUser(authResult.user);
            }
          }
        } catch (error) {
          console.error("Auth error:", error);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
