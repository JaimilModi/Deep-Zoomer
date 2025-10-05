import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import OpenSeadragon from "openseadragon";

const Viewer = () => {
  const viewerRef = useRef(null);
  const osdRef = useRef(null);
  const location = useLocation();
  const { imageUrl, title } = location.state || {};

  useEffect(() => {
    if (!viewerRef.current || !imageUrl) return;

    const container = viewerRef.current;
    container.style.position = "relative"; // enable overlay positioning

    // Configure tile source for DZI files
    const tileSource = {
      type: "image",
      url: imageUrl,
      // DZI-specific configuration
      tileSource: {
        type: "dzi",
        url: imageUrl,
        tileSize: 256,
        overlap: 1,
        format: "jpg"
      }
    };

    osdRef.current = OpenSeadragon({
      element: container,
      prefixUrl:
        "https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/",
      tileSources: imageUrl, // Use DZI file directly
      showNavigator: true,
      animationTime: 0.5,
      blendTime: 0.1,
      constrainDuringPan: true,
      // Pixel-perfect zooming configuration
      maxZoomPixelRatio: 2, // Allow 2x pixel ratio for crisp rendering
      minZoomImageRatio: 0.1, // Allow zooming out to 10% of original size
      maxZoomLevel: 20, // Maximum zoom level
      minZoomLevel: 0, // Minimum zoom level
      // Tile configuration for better quality
      tileSize: 256, // Match DZI tile size
      imageLoaderLimit: 5, // Limit concurrent tile loads
      timeout: 30000, // 30 second timeout for tile loading
      // Smooth zooming and panning
      springStiffness: 5.0,
      animationTime: 1.2,
      // Gesture settings for better control
      gestureSettingsMouse: {
        scrollToZoom: true,
        clickToZoom: true,
        dblClickToZoom: true,
        flickEnabled: true,
        pinchToZoom: true,
      },
      gestureSettingsTouch: {
        scrollToZoom: true,
        clickToZoom: true,
        dblClickToZoom: true,
        flickEnabled: true,
        pinchToZoom: true,
      },
      // Image quality settings
      imageLoaderLimit: 5,
      loadTilesWithAjax: true,
      ajaxWithCredentials: false,
      // Smooth transitions
      springStiffness: 5.0,
      animationTime: 1.2,
      blendTime: 0.1,
      // Retry configuration for reliability
      tileRetryMax: 3,
      tileRetryDelay: 1000,
      tileLoadTimeout: 10000,
    });

    const viewer = osdRef.current;

    // Flash overlay on zoom
    const handleZoom = () => {
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.top = "0px";
      overlay.style.left = "0px";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.background = "rgba(255,255,255,0.1)";
      overlay.style.backdropFilter = "blur(1px)";
      overlay.style.transition = "opacity 0.1s";
      overlay.style.opacity = "0.7";
      overlay.style.pointerEvents = "none";
      container.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.opacity = "0";
        setTimeout(() => container.removeChild(overlay), 100);
      });
    };

    viewer.addHandler("zoom", handleZoom);

    return () => {
      viewer.removeHandler("zoom", handleZoom);
      if (osdRef.current && osdRef.current.destroy) osdRef.current.destroy();
    };
  }, [imageUrl]);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Optional title overlay */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.4)",
            color: "white",
            padding: "4px 10px",
            borderRadius: "4px",
            zIndex: 10,
            fontSize: "16px",
            pointerEvents: "none",
          }}
        >
          {title}
        </div>
      )}
      <div ref={viewerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default Viewer;
