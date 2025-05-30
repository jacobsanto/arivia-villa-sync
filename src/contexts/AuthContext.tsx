
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAuthState = async () => {
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      setSession(data.session);
      
      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profile) {
          const newUser = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: profile.name || data.session.user.email?.split('@')[0] || 'User',
            role: profile.role as UserRole || 'property_manager',
            avatar: profile.avatar || "/placeholder.svg",
            phone: profile.phone,
            secondaryRoles: profile.secondary_roles ? profile.secondary_roles.map(role => role as UserRole) : undefined,
            customPermissions: profile.custom_permissions as Record<string, boolean> || {}
          };
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error refreshing auth state:", err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication error';
      setError(errorMessage);
      toastService.error("Authentication error", {
        description: "There was a problem refreshing your session"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state change event:", event);
        setSession(newSession);
        
        if (newSession?.user) {
          // Use setTimeout to prevent auth deadlock
          setTimeout(() => {
            supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single()
              .then(({ data: profile }) => {
                if (profile) {
                  const newUser = {
                    id: newSession.user.id,
                    email: newSession.user.email || '',
                    name: profile.name || newSession.user.email?.split('@')[0] || 'User',
                    role: profile.role as UserRole || 'property_manager',
                    avatar: profile.avatar || "/placeholder.svg",
                    phone: profile.phone,
                    secondaryRoles: profile.secondary_roles ? profile.secondary_roles.map(role => role as UserRole) : undefined,
                    customPermissions: profile.custom_permissions as Record<string, boolean> || {}
                  };
                  setUser(newUser);
                }
              });
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Initialize auth state
    refreshAuthState();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    error,
    refreshAuthState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
