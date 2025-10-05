import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OpenSeadragon from "openseadragon";

const WorkingViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const { imageUrl, title } = state;

  const viewerRef = useRef<HTMLDivElement>(null);
  const osdRef = useRef<any>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    const container = viewerRef.current;
    
    // Simple, working configuration
    osdRef.current = OpenSeadragon({
      element: container,
      prefixUrl: "https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/",
      tileSources: imageUrl || "/earth_tiles.dzi",
      showNavigator: true,
      showNavigationControl: true,
      showFullPageControl: true,
      showZoomControl: true,
      showHomeControl: true,
      showRotationControl: true,
      
      // Basic working settings
      maxZoomPixelRatio: 1.5,
      minZoomImageRatio: 0.1,
      maxZoomLevel: 15,
      minZoomLevel: 0,
      
      // Simple tile handling
      tileSize: 256,
      imageLoaderLimit: 2,
      timeout: 15000,
      
      // Smooth controls
      springStiffness: 5.0,
      animationTime: 1.0,
      blendTime: 0.1,
      constrainDuringPan: true,
      
      // Gesture settings
      gestureSettingsMouse: {
        scrollToZoom: true,
        clickToZoom: true,
        dblClickToZoom: true,
        flickEnabled: true,
        pinchToZoom: true,
      },
      
      // Error handling
      tileRetryMax: 2,
      tileRetryDelay: 500,
      tileLoadTimeout: 10000,
    });

    const viewer = osdRef.current;

    // Simple error handling
    viewer.addHandler("tile-load-failed", (event: any) => {
      console.log("Tile load failed, retrying...", event);
    });

    viewer.addHandler("error", (event: any) => {
      console.log("Viewer error:", event);
    });

    return () => {
      if (osdRef.current && osdRef.current.destroy) {
        osdRef.current.destroy();
      }
    };
  }, [imageUrl]);

  if (!state) {
    navigate("/gallery");
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Simple header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur z-20">
        <div className="flex-1 min-w-0 mr-4">
          <h2 className="text-lg font-semibold truncate">{title || "Deep Zoom Viewer"}</h2>
        </div>
        <button
          onClick={() => navigate("/gallery")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Back to Gallery
        </button>
      </div>

      {/* Viewer */}
      <div className="flex-1 relative">
        <div 
          ref={viewerRef} 
          className="w-full h-full"
          style={{ minHeight: "500px" }}
        />
      </div>

      {/* Simple instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-black/50 text-white px-4 py-2 rounded text-sm">
          Scroll to zoom • Drag to pan • Double-click to zoom in
        </div>
      </div>
    </div>
  );
};

export default WorkingViewer;
