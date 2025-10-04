import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, X, RotateCcw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

interface LocationState {
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  nasaId: string;
}

export const ImageViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!state) {
    navigate("/gallery");
    return null;
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur z-10">
        <div className="flex-1 min-w-0 mr-4">
          <h2 className="text-lg font-semibold truncate">{state.title}</h2>
          <p className="text-sm text-muted-foreground truncate">NASA ID: {state.nasaId}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/gallery")}
          className="flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Viewer */}
      <div className="flex-1 relative overflow-hidden">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={10}
          centerOnInit
          wheel={{ step: 0.1 }}
          doubleClick={{ mode: "zoomIn", step: 0.7 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <Button
                  size="icon"
                  onClick={() => zoomIn()}
                  className="bg-primary/20 backdrop-blur border border-primary/30 hover:bg-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300"
                >
                  <ZoomIn className="w-5 h-5 text-primary" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => zoomOut()}
                  className="bg-accent/20 backdrop-blur border border-accent/30 hover:bg-accent/30 hover:shadow-[0_0_20px_hsl(var(--accent)/0.4)] transition-all duration-300"
                >
                  <ZoomOut className="w-5 h-5 text-accent" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => resetTransform()}
                  className="bg-secondary backdrop-blur border border-border hover:bg-secondary/80 hover:shadow-lg transition-all duration-300"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  onClick={toggleFullscreen}
                  className="bg-secondary backdrop-blur border border-border hover:bg-secondary/80 hover:shadow-lg transition-all duration-300"
                >
                  <Maximize2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Image */}
              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full flex items-center justify-center"
              >
                <img
                  src={state.imageUrl}
                  alt={state.title}
                  className="max-w-full max-h-full object-contain select-none"
                  draggable={false}
                  loading="eager"
                />
              </TransformComponent>

              {/* Instructions overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 backdrop-blur-lg rounded-lg px-6 py-3 border border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
                  <p className="text-sm font-medium bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
                    🔍 Scroll to zoom • ✋ Drag to pan • 🖱️ Double-click to zoom in
                  </p>
                </div>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Description */}
      {state.description && (
        <div className="border-t border-border bg-card/50 backdrop-blur p-4 max-h-32 overflow-y-auto">
          <p className="text-sm text-foreground/80">{state.description}</p>
        </div>
      )}
    </div>
  );
};
