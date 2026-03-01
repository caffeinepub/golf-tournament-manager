import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Mail, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";

export function ProfileCompletionModal() {
  const {
    needsProfileCompletion,
    saveProfile,
    savingProfile,
    isAuthenticated,
  } = useAuthContext();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ username?: string; email?: string }>(
    {},
  );

  const visible = isAuthenticated && needsProfileCompletion;

  function validate() {
    const errs: { username?: string; email?: string } = {};
    if (!username.trim() || username.trim().length < 2) {
      errs.username =
        "Le nom d'utilisateur doit contenir au moins 2 caractères.";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Veuillez saisir une adresse e-mail valide.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await saveProfile({ username: username.trim(), email: email.trim() });
      toast.success("Profil enregistré ! Bienvenue 🏌️");
    } catch {
      toast.error("Erreur lors de l'enregistrement du profil. Réessayez.");
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 pb-10 sm:pb-6"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center mb-5 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User size={24} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold font-serif text-foreground leading-tight">
                Complétez votre profil
              </h2>
              <p className="text-sm text-muted-foreground font-sans mt-1.5 leading-relaxed">
                Quelques informations pour personnaliser votre expérience sur
                Golf Tournament Manager.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="space-y-4"
              noValidate
            >
              {/* Username */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="profile-username"
                  className="text-sm font-medium font-sans text-foreground"
                >
                  Nom d'utilisateur
                </Label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <Input
                    id="profile-username"
                    type="text"
                    placeholder="ex: Jean Dupont"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username)
                        setErrors((p) => ({ ...p, username: undefined }));
                    }}
                    className="pl-9 font-sans"
                    autoComplete="name"
                    disabled={savingProfile}
                    aria-invalid={!!errors.username}
                    aria-describedby={
                      errors.username ? "username-error" : undefined
                    }
                  />
                </div>
                {errors.username && (
                  <p
                    id="username-error"
                    className="text-xs text-destructive font-sans"
                  >
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="profile-email"
                  className="text-sm font-medium font-sans text-foreground"
                >
                  Adresse e-mail
                </Label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <Input
                    id="profile-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    className="pl-9 font-sans"
                    autoComplete="email"
                    disabled={savingProfile}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-xs text-destructive font-sans"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-semibold font-sans rounded-xl mt-2"
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Enregistrement…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Accéder à l'application
                    <ArrowRight size={16} />
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
