import {
  FolderGit2,
  FileText,
  Sparkles,
  Briefcase,
  LayoutDashboard,
  LogIn,
  ExternalLink,
} from "lucide-react";

interface NavIconProps {
  name?: string | undefined;
  className?: string | undefined;
  size?: number | undefined;
}

export function NavIcon({ name, className = "h-4 w-4", size = 16 }: NavIconProps) {
  if (!name) return null;

  switch (name) {
    case "folder-git-2":
    case "projects":
      return <FolderGit2 className={className} size={size} aria-hidden="true" />;
    case "file-text":
    case "cv":
      return <FileText className={className} size={size} aria-hidden="true" />;
    case "sparkles":
    case "ai":
      return <Sparkles className={className} size={size} aria-hidden="true" />;
    case "briefcase":
    case "job-fit":
      return <Briefcase className={className} size={size} aria-hidden="true" />;
    case "layout-dashboard":
    case "admin":
      return <LayoutDashboard className={className} size={size} aria-hidden="true" />;
    case "log-in":
      return <LogIn className={className} size={size} aria-hidden="true" />;
    case "external-link":
      return <ExternalLink className={className} size={size} aria-hidden="true" />;
    default:
      return null;
  }
}
