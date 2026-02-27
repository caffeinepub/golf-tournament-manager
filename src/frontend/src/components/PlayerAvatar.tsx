interface PlayerAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AVATAR_COLORS = [
  "bg-emerald-600 text-white",
  "bg-teal-600 text-white",
  "bg-green-700 text-white",
  "bg-cyan-700 text-white",
  "bg-lime-700 text-white",
  "bg-sky-700 text-white",
  "bg-indigo-600 text-white",
  "bg-violet-600 text-white",
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-xl",
};

export function PlayerAvatar({ name, size = "md", className = "" }: PlayerAvatarProps) {
  const colorClass = getColorForName(name);
  const initials = getInitials(name);
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div
      className={`${sizeClass} ${colorClass} ${className} rounded-full flex items-center justify-center font-bold font-sans shrink-0`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
