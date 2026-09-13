import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, getBusinessAccount, BusinessAccount } from "@/lib/supabase";
import { getMonthlyRequestCount } from "@/lib/supabase-utils";

/** Free plan monthly request cap */
export const FREE_REQUEST_LIMIT = 5;

/** Free plan customer cap */
export const FREE_CUSTOMER_LIMIT = 10;

export type AuthContextType = {
  user: User | null;
  businessAccount: BusinessAccount | null;
  loading: boolean;
  isPaid: boolean;
  monthlyRequestCount: number;
};

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [businessAccount, setBusinessAccount] = useState<BusinessAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyRequestCount, setMonthlyRequestCount] = useState(0);

  async function loadAccount(userId: string) {
    const account = await getBusinessAccount(userId);
    setBusinessAccount(account);
    if (account) {
      const count = await getMonthlyRequestCount(account.id);
      setMonthlyRequestCount(count);
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await loadAccount(session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadAccount(session.user.id);
      } else {
        setUser(null);
        setBusinessAccount(null);
        setMonthlyRequestCount(0);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return {
    user,
    businessAccount,
    loading,
    isPaid: businessAccount?.is_paid || false,
    monthlyRequestCount,
  };
}
