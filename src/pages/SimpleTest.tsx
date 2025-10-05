import { useEffect, useRef } from "react";
import OpenSeadragon from "openseadragon";

const SimpleTest = () => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const osdRef = useRef<any>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    const container = viewerRef.current;

    // Test with a simple image first
    const testImage = "/earth-image.jpg";

    osdRef.current = OpenSeadragon({
      element: container,
      prefixUrl: "https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/",
      tileSources: {
        type: "image",
        url: testImage
      },
      showNavigator: true,
      showNavigationControl: true,
      showFullPageControl: true,
      showZoomControl: true,
      showHomeControl: true,
      showRotationControl: true,
      
      // Simple settings that work
      maxZoomPixelRatio: 1.5,
      minZoomImageRatio: 0.1,
      maxZoomLevel: 10,
      minZoomLevel: 0,
      
      // Basic tile handling
      tileSize: 256,
      imageLoaderLimit: 2,
      timeout: 10000,
      
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
    });

    const viewer = osdRef.current;

    // Simple logging
    viewer.addHandler("open", () => {
      console.log("✅ Image loaded successfully!");
    });

    viewer.addHandler("error", (event: any) => {
      console.error("❌ Error:", event);
    });

    return () => {
      if (osdRef.current && osdRef.current.destroy) {
        osdRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pt-28">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Simple Image Test</h1>
        <p className="text-muted-foreground mb-4">
          Testing with a regular image first to ensure OpenSeadragon works
        </p>
        
        <div className="bg-card border rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Test Information</h2>
          <ul className="text-sm space-y-1">
            <li>• Image: /earth-image.jpg</li>
            <li>• Type: Regular image (not DZI)</li>
            <li>• This should work without tile issues</li>
            <li>• Check console for success/error messages</li>
          </ul>
        </div>

        <div 
          ref={viewerRef} 
          className="w-full h-96 border border-border rounded-lg bg-muted"
        />
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>If this works, the issue is with DZI files. If this fails, the issue is with OpenSeadragon setup.</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;
