import {
  FolderGit2,
  FileText,
  Sparkles,
  Briefcase,
  LayoutDashboard,
  FlaskConical,
  LogIn,
  ExternalLink,
  BarChart2,
  User,
  Mail,
  Clock,
  Home,
  Award,
} from "lucide-react";

interface NavIconProps {
  name?: string | undefined;
  className?: string | undefined;
  size?: number | undefined;
}

export function NavIcon({ name, className = "h-4 w-4", size = 16 }: NavIconProps) {
  if (!name) return null;

  switch (name) {
    case "home":
      return <Home className={className} size={size} aria-hidden="true" />;
    case "folder-git-2":
    case "projects":
      return <FolderGit2 className={className} size={size} aria-hidden="true" />;
    case "file-text":
    case "cv":
    case "resume":
      return <FileText className={className} size={size} aria-hidden="true" />;
    case "award":
    case "certificate":
    case "certificates":
    case "courses":
      return <Award className={className} size={size} aria-hidden="true" />;
    case "briefcase":
    case "experience":
      return <Briefcase className={className} size={size} aria-hidden="true" />;
    case "user":
    case "about":
      return <User className={className} size={size} aria-hidden="true" />;
    case "mail":
    case "contact":
      return <Mail className={className} size={size} aria-hidden="true" />;
    case "sparkles":
    case "ai":
    case "assistant":
      return <Sparkles className={className} size={size} aria-hidden="true" />;
    case "job-fit":
      return <Briefcase className={className} size={size} aria-hidden="true" />;
    case "flask-conical":
    case "lab":
      return <FlaskConical className={className} size={size} aria-hidden="true" />;
    case "layout-dashboard":
    case "admin":
      return <LayoutDashboard className={className} size={size} aria-hidden="true" />;
    case "chart-bar":
    case "evaluation":
      return <BarChart2 className={className} size={size} aria-hidden="true" />;
    case "log-in":
      return <LogIn className={className} size={size} aria-hidden="true" />;
    case "external-link":
      return <ExternalLink className={className} size={size} aria-hidden="true" />;
    case "clock":
      return <Clock className={className} size={size} aria-hidden="true" />;
    default:
      return null;
  }
}
