import { Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative bg-background border-t border-muted-foreground/20 mt-24">
      <div className="container mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-aurora-gradient animate-aurora bg-[length:200%_auto]">
          Meet the Team
        </h2>
        <p className="text-muted-foreground mb-8">
          Our space explorers who made DeepZoomer possible
        </p>

        <div className="flex justify-center flex-wrap gap-6">
          {/* Team Member */}
          <a
            href="https://github.com/JaimilModi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-xl hover:bg-primary/10 hover:shadow-cosmic transition-all duration-300"
          >
            <Github className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">Jaimil Modi</span>
          </a>

          <a
            href="https://github.com/vashishth-182"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-xl hover:bg-primary/10 hover:shadow-cosmic transition-all duration-300"
          >
            <Github className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">Vashishth Prajapati</span>
          </a>

          <a
            href="https://github.com/Vishvam2006"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-xl hover:bg-primary/10 hover:shadow-cosmic transition-all duration-300"
          >
            <Github className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">Vishvam Modi</span>
          </a>

          <a
            href="https://github.com/Hiren-Sarvaiya"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-xl hover:bg-primary/10 hover:shadow-cosmic transition-all duration-300"
          >
            <Github className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">Hiren Sarvaiya</span>
          </a>
        </div>

        <p className="text-sm text-muted-foreground mt-12">
          &copy; {new Date().getFullYear()} DeepZoomer. Powered by NASA Imagery.
        </p>
      </div>
    </footer>
  );
};
