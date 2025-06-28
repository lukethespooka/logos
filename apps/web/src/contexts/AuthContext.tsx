import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        // First try to get the session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
        // Only attempt auto sign-in if we haven't explicitly logged out
        else if (!hasLoggedOut && localStorage.getItem('last-sign-in-attempt')) {
          await signIn();
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      // Only attempt auto sign-in if we haven't explicitly logged out
      if (!currentSession && !hasLoggedOut && localStorage.getItem('last-sign-in-attempt')) {
        try {
          await signIn();
        } catch (error) {
          console.error("Error during auto sign-in:", error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [hasLoggedOut]); // Add hasLoggedOut to dependencies

  const signIn = async () => {
    try {
      setIsLoading(true);
      setHasLoggedOut(false);
      
      // Try to sign in with credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "test123",
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        // Store last successful sign-in timestamp
        localStorage.setItem('last-sign-in-attempt', new Date().toISOString());
      }
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setHasLoggedOut(true);
      // Clear the sign-in timestamp
      localStorage.removeItem('last-sign-in-attempt');
      // Clear any stored auth data
      localStorage.removeItem('logos-auth-token');
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 