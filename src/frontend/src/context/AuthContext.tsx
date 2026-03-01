import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ─── Types ─────────────────────────────────────────────────────────────────

interface AuthContextValue {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  login: () => void;
  logout: () => void;
  userProfile: UserProfile | null;
  loadingProfile: boolean;
  needsProfileCompletion: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  savingProfile: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    identity,
    login,
    clear: logout,
    isInitializing,
    isLoggingIn,
    isLoginSuccess,
  } = useInternetIdentity();

  const { actor, isFetching } = useActor();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  // track if we've already fetched for this identity session
  const [profileFetched, setProfileFetched] = useState(false);

  // Fetch profile when authenticated and actor is ready
  useEffect(() => {
    if (!isAuthenticated || !actor || isFetching || profileFetched) return;

    let cancelled = false;
    setLoadingProfile(true);
    setProfileFetched(true);

    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (cancelled) return;
        if (profile === null || profile === undefined) {
          setUserProfile(null);
          setNeedsProfileCompletion(true);
        } else {
          setUserProfile(profile);
          setNeedsProfileCompletion(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUserProfile(null);
          setNeedsProfileCompletion(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, actor, isFetching, profileFetched]);

  // Reset profile state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setUserProfile(null);
      setNeedsProfileCompletion(false);
      setProfileFetched(false);
    }
  }, [isAuthenticated]);

  // Reset fetched flag on new login success so profile is re-fetched
  useEffect(() => {
    if (isLoginSuccess) {
      setProfileFetched(false);
    }
  }, [isLoginSuccess]);

  const saveProfile = useCallback(
    async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      setSavingProfile(true);
      try {
        await actor.saveCallerUserProfile(profile);
        setUserProfile(profile);
        setNeedsProfileCompletion(false);
      } finally {
        setSavingProfile(false);
      }
    },
    [actor],
  );

  const value: AuthContextValue = {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    login,
    logout,
    userProfile,
    loadingProfile,
    needsProfileCompletion,
    saveProfile,
    savingProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
