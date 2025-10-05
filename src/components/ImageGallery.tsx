import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, Eye } from "lucide-react";

export const ImageGallery = () => {
  const navigate = useNavigate();

  const images = [
    {
      href: "/nasa-image.jpg",
      title: "Moon Surface (NASA October 2025)",
      description: "High resolution Moon surface image.",
      date_created: new Date().toISOString(),
      nasa_id: "moon-2025",
      highResUrl: "/moon_tiles.dzi",
    },
    {
      href: "/earth-image.jpg",
      title: "Earth Day",
      description: "High-resolution daytime Earth image.",
      date_created: new Date().toISOString(),
      nasa_id: "earth-day-2025",
      highResUrl: "/earth_tiles.dzi",
    },
    {
      href: "/earth-night-image.jpg",
      title: "Earth Night",
      description: "High-resolution nighttime Earth image.",
      date_created: new Date().toISOString(),
      nasa_id: "earth-night-2025",
      highResUrl: "/earth_night_tiles.dzi",
    },
    // ✅ New Earth-2 image
    {
      href: "/earth-2.png",
      title: "Earth 2 Zoom",
      description: "Tile-based zoomable image of Earth (new)",
      date_created: new Date().toISOString(),
      nasa_id: "earth-2-2025",
      highResUrl: "/earth-2.dzi",
    },
  ];

  const handleImageClick = (image) => {
    navigate("/ai-viewer", {
      state: {
        imageUrl: image.href,
        thumbnailUrl: image.href,
        title: image.title,
        description: image.description,
        nasaId: image.nasa_id,
      },
    });
  };

  const handlePixelPerfectClick = (image) => {
    navigate("/pixel-viewer", {
      state: {
        imageUrl: image.highResUrl,
        thumbnailUrl: image.href,
        title: image.title,
        description: image.description,
        nasaId: image.nasa_id,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 pt-28">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-aurora-gradient">
            NASA Image Gallery (Local Demo)
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Showing Moon & Earth images from public folder
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <Card
              key={index}
              className="group cursor-pointer overflow-hidden border-border hover:border-primary transition-all duration-300 hover:shadow-cosmic"
              onClick={() => handleImageClick(image)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={image.href}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-semibold text-sm line-clamp-2">{image.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(image.date_created).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageClick(image);
                              }}
                              className="flex-1"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePixelPerfectClick(image);
                              }}
                              className="flex-1"
                            >
                              <Target className="w-3 h-3 mr-1" />
                              Pixel Perfect
                            </Button>
                          </div>
                        </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
