import { Link, useLocation } from "react-router-dom";
import { Home, Image, Sparkles, Search, Brain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-primary group-hover:animate-pulse" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
              DeepZoomer
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                isActive("/")
                  ? "bg-primary/20 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              to="/gallery"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                isActive("/gallery")
                  ? "bg-accent/20 text-accent shadow-[0_0_20px_hsl(var(--accent)/0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Gallery</span>
            </Link>

            {/* NASA Search Button */}
            <Link
              to="/nasa-search"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                isActive("/nasa-search")
                  ? "bg-primary/20 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">NASA Search</span>
            </Link>

            {/* AI-Enhanced Search Button */}
            <Link
              to="/ai-search"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                isActive("/ai-search")
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 shadow-[0_0_20px_hsl(270_100%_70%/0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Search</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
