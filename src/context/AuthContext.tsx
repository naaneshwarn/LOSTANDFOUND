import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, DemoPersona } from '../types/auth';
import { DEMO_PERSONAS } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  activePersona: DemoPersona | null;
  switchPersona: (personaId: string | null) => void;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'lostfound_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Sarah Chen (demo student persona) for immediate out-of-the-box usability
  const [activePersona, setActivePersona] = useState<DemoPersona | null>(DEMO_PERSONAS[0]);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Return Sarah Chen as default active profile
    return {
      id: DEMO_PERSONAS[0].id,
      email: DEMO_PERSONAS[0].email,
      fullName: DEMO_PERSONAS[0].fullName,
      avatarUrl: DEMO_PERSONAS[0].avatarUrl,
      role: DEMO_PERSONAS[0].role,
      phoneObfuscated: '+1 (555) ***-4821',
      createdAt: '2026-10-01T10:00:00Z',
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isDemoMode = !isSupabaseConfigured || activePersona !== null;

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user && !activePersona) {
          fetchSupabaseProfile(session.user.id, session.user.email || '');
        } else {
          setIsLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user && !activePersona) {
          fetchSupabaseProfile(session.user.id, session.user.email || '');
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [activePersona]);

  async function fetchSupabaseProfile(userId: string, email: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          fullName: data.full_name || email.split('@')[0],
          avatarUrl: data.avatar_url || undefined,
          role: data.role as any,
          phoneObfuscated: data.phone_obfuscated || undefined,
          createdAt: data.created_at,
        };
        setUser(profile);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
      }
    } catch (e) {
      console.warn('Failed to fetch profile from Supabase:', e);
    } finally {
      setIsLoading(false);
    }
  }

  const switchPersona = (personaId: string | null) => {
    if (!personaId) {
      // Switch to guest
      setActivePersona(null);
      setUser(null);
      localStorage.removeItem(LOCAL_USER_KEY);
      return;
    }

    const persona = DEMO_PERSONAS.find((p) => p.id === personaId);
    if (persona) {
      setActivePersona(persona);
      const profile: UserProfile = {
        id: persona.id,
        email: persona.email,
        fullName: persona.fullName,
        avatarUrl: persona.avatarUrl,
        role: persona.role,
        phoneObfuscated: persona.role === 'admin' ? '+1 (555) ***-0001' : '+1 (555) ***-9999',
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    }
  };

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setActivePersona(null);
          await fetchSupabaseProfile(data.user.id, data.user.email || email);
          return;
        }
      }

      // Demo login
      const matchedPersona = DEMO_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (matchedPersona) {
        switchPersona(matchedPersona.id);
      } else {
        // Custom user
        const customProfile: UserProfile = {
          id: `usr_${Date.now()}`,
          email,
          fullName: email.split('@')[0],
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        setActivePersona(null);
        setUser(customProfile);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(customProfile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.user) {
          setActivePersona(null);
          await fetchSupabaseProfile(data.user.id, email);
          return;
        }
      }

      // Demo signup
      const newProfile: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        fullName,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      setActivePersona(null);
      setUser(newProfile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setActivePersona(null);
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updates.fullName,
            avatar_url: updates.avatarUrl,
            phone_obfuscated: updates.phoneObfuscated,
          })
          .eq('id', user.id);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoMode,
        activePersona,
        switchPersona,
        login,
        signup,
        logout,
        updateProfile,
        isAdmin,
        isModerator,
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
