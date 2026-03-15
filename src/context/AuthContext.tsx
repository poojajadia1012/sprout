import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type DbUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  auth_provider: 'google' | 'email';
  verified_at: string | null;
  deleted_at: string | null;
  created_at: string;
  status: 'registered' | 'active';
};

type SignUpParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type AuthResult = { error: string | null };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  dbUser: DbUser | null;
  isLoading: boolean;
  signUpWithEmail: (params: SignUpParams) => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  handleGoogleSignIn: (idToken: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<AuthResult>;
  sendPasswordResetEmail: (email: string) => Promise<AuthResult>;
  resetPassword: (newPassword: string) => Promise<AuthResult>;
  deleteAccount: () => Promise<AuthResult>;
  updateUserStatus: (status: DbUser['status']) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchDbUser(userId: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as DbUser;
}

async function reactivateAccount(userId: string): Promise<void> {
  await supabase
    .from('users')
    .update({ deleted_at: null })
    .eq('id', userId);
}

function isWithin30Days(deletedAt: string): boolean {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return new Date(deletedAt) > thirtyDaysAgo;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function handleSession(activeSession: Session) {
    setSession(activeSession);
    setUser(activeSession.user);

    const data = await fetchDbUser(activeSession.user.id);
    if (data?.deleted_at) {
      if (isWithin30Days(data.deleted_at)) {
        await reactivateAccount(activeSession.user.id);
        const reactivated = await fetchDbUser(activeSession.user.id);
        setDbUser(reactivated);
      } else {
        await supabase.auth.signOut();
      }
    } else {
      setDbUser(data);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await handleSession(session);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsLoading(false);
        return;
      }
      if (session) {
        await handleSession(session);
      } else {
        setSession(null);
        setUser(null);
        setDbUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithEmail = async ({ firstName, lastName, email, password }: SignUpParams): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          auth_provider: 'email',
        },
        emailRedirectTo: 'recipeapp://',
      },
    });
    return { error: error?.message ?? null };
  };

  const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Incorrect email or password. Please try again.' };
    return { error: null };
  };

  const handleGoogleSignIn = async (idToken: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  const resendVerificationEmail = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: 'recipeapp://' },
    });
    return { error: error?.message ?? null };
  };

  const sendPasswordResetEmail = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'recipeapp://reset-password',
    });
    return { error: error?.message ?? null };
  };

  const resetPassword = async (newPassword: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  };

  const updateUserStatus = async (newStatus: DbUser['status']): Promise<void> => {
    if (!user) return;
    await supabase.from('users').update({ status: newStatus }).eq('id', user.id);
    setDbUser((prev) => prev ? { ...prev, status: newStatus } : prev);
  };

  const deleteAccount = async (): Promise<AuthResult> => {
    if (!user) return { error: 'Not logged in.' };
    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) return { error: error.message };
    await supabase.auth.signOut();
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      dbUser,
      isLoading,
      signUpWithEmail,
      signInWithEmail,
      handleGoogleSignIn,
      signOut,
      resendVerificationEmail,
      sendPasswordResetEmail,
      resetPassword,
      deleteAccount,
      updateUserStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
