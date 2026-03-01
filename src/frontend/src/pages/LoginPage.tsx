import { Button } from "@/components/ui/button";
import { Flag, Shield, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useAuthContext } from "../context/AuthContext";

// Decorative golf hole dots
function GolfPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="golf-dots"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="20" cy="20" r="2" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#golf-dots)" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: Shield,
    title: "Sécurisé & Privé",
    desc: "Authentification cryptographique — aucun mot de passe requis",
  },
  {
    icon: Zap,
    title: "Connexion Instantanée",
    desc: "Un clic suffit pour accéder à vos tournois",
  },
  {
    icon: Users,
    title: "Profil de Joueur",
    desc: "Gérez vos scores et votre handicap personnellement",
  },
];

export default function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useAuthContext();

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Hero section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 header-gradient overflow-hidden">
        <GolfPattern />

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        <motion.div
          className="relative z-10 text-center max-w-sm w-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo mark */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-8"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <Flag size={26} className="text-white" />
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl font-bold font-serif text-white leading-[1.15] mb-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
          >
            Golf
            <br />
            <span className="text-white/75">Tournament</span>
            <br />
            Manager
          </motion.h1>

          <motion.p
            className="text-white/65 text-sm font-sans leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            Gérez vos tournois, suivez les scores en direct, et consultez les
            classements en temps réel.
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom card */}
      <motion.div
        className="bg-card px-6 pt-7 pb-10 rounded-t-3xl -mt-6 relative z-20 shadow-[0_-4px_32px_rgba(0,0,0,0.12)]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-sm mx-auto">
          {/* Features */}
          <div className="space-y-3 mb-7">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08, duration: 0.35 }}
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <feature.icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-sans text-foreground leading-tight">
                    {feature.title}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans mt-0.5 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-sans px-2">
              Connexion sécurisée
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.35 }}
          >
            <Button
              className="w-full h-13 text-base font-semibold font-sans rounded-2xl shadow-md"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              size="lg"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Connexion en cours…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield size={18} />
                  Se connecter / S'inscrire
                </span>
              )}
            </Button>
          </motion.div>

          <p className="text-center text-xs text-muted-foreground font-sans mt-4 leading-relaxed">
            Utilise Internet Identity — aucun mot de passe, aucune donnée
            partagée.
            <br />
            La première connexion crée automatiquement votre compte.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
