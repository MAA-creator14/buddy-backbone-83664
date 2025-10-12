import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAuth = (requireAuth: boolean = false) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Redirect to auth if required and no session
        if (requireAuth && !session && event !== 'INITIAL_SESSION') {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Redirect to auth if required and no session
      if (requireAuth && !session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [requireAuth, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return { user, session, loading, signOut };
};
