import { Button } from "@/components/ui/button";
import { Search, Sparkles, Telescope } from "lucide-react";
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

          {/* New NASA Search Button */}
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/nasa-search')}
            className="border-accent/50 hover:border-accent hover:bg-accent/10 text-lg px-8 py-6"
          >
            <Telescope className="w-5 h-5 mr-2" />
            Search NASA Images
          </Button>
        </div>
      </div>
    </section>
  );
};
