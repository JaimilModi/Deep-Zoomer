import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-nebula-gradient opacity-50 animate-pulse-glow" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-6 animate-float">
          <Sparkles className="w-6 h-6 text-primary-glow" />
          <span className="text-sm uppercase tracking-wider text-muted-foreground">Powered by NASA Imagery</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-aurora-gradient animate-aurora bg-[length:200%_auto]">
          DeepZoomer
        </h1>

        <p className="text-xl md:text-2xl text-foreground/90 mb-4 max-w-3xl mx-auto">
          Explore the cosmos in infinite detail
        </p>

        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          Discover what your eyes can't see. Zoom into NASA's stunning imagery and reveal the universe's hidden beauty.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={() => navigate('/gallery')}
            className="group bg-primary hover:bg-primary-glow transition-all duration-300 shadow-cosmic hover:shadow-accent text-lg px-8 py-6"
          >
            <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Explore Images
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/gallery')}
            className="border-primary/50 hover:border-primary hover:bg-primary/10 text-lg px-8 py-6"
          >
            Learn More
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
            {/* Telescope Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 mb-3 text-primary"
            >
              <rect x="2" y="4" width="8" height="3" rx="1" transform="rotate(-25 6 6)" />
              <circle cx="16" cy="5" r="2" />
              <line x1="3" y1="12" x2="21" y2="4" />
              <line x1="7" y1="20" x2="10" y2="14" />
              <line x1="14" y1="20" x2="17" y2="14" />
            </svg>
            <h3 className="font-semibold mb-2">Infinite Resolution</h3>
            <p className="text-sm text-muted-foreground">Zoom without limits, no quality loss</p>
          </div>

          <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
            {/* Planet Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 mb-3 text-primary"
            >
              <circle cx="12" cy="12" r="4.2" />
              <ellipse cx="12" cy="12.2" rx="8.5" ry="2.6" transform="rotate(-20 12 12.2)" />
              <path d="M5 6c1 1.5 3 2.5 5 2.8" />
            </svg>
            <h3 className="font-semibold mb-2">NASA Archive</h3>
            <p className="text-sm text-muted-foreground">Access stunning space imagery</p>
          </div>

          <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
            {/* Sparkles Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 mb-3 text-primary"
            >
              <path d="M12 3l1.6 3.6L17 8l-3.4 1.4L12 13l-1.6-3.6L7 8l3.4-1.4L12 3z" />
              <path d="M4 15l.9 2.1L7 18l-2.1.9L4 21l-.9-2.1L1 18l2.1-.9L4 15z" />
              <path d="M20 16l.6 1.4L22 18l-1.4.6L20 20l-.6-1.4L18 18l1.4-.6L20 16z" />
            </svg>
            <h3 className="font-semibold mb-2">Fluid Experience</h3>
            <p className="text-sm text-muted-foreground">Smooth navigation on any device</p>
          </div>
        </div>

      </div>
    </section>
  );
};
