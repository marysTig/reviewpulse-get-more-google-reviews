import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, getBusinessAccount, BusinessAccount } from "@/lib/supabase";

export type AuthContextType = {
  user: User | null;
  businessAccount: BusinessAccount | null;
  loading: boolean;
  isPaid: boolean;
};

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [businessAccount, setBusinessAccount] = useState<BusinessAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          const account = await getBusinessAccount(session.user.id);
          setBusinessAccount(account);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const account = await getBusinessAccount(session.user.id);
        setBusinessAccount(account);
      } else {
        setUser(null);
        setBusinessAccount(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return {
    user,
    businessAccount,
    loading,
    isPaid: businessAccount?.isPaid || false,
  };
}
