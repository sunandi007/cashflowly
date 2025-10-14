import { supabase } from "@/services/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsReady(true);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, isReady };
}
