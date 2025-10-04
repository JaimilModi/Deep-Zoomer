import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NASAImage {
  href: string;
  data: Array<{
    title: string;
    description: string;
    date_created: string;
    nasa_id: string;
  }>;
  links?: Array<{
    href: string;
    rel: string;
  }>;
  highResUrl?: string;
}

export const ImageGallery = () => {
  const [images, setImages] = useState<NASAImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("nebula");
  const navigate = useNavigate();

  const fetchImages = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://images-api.nasa.gov/search?q=${query}&media_type=image&page_size=24`
      );
      const data = await response.json();
      
      // Fetch higher resolution images from asset manifest
      const enhancedImages = await Promise.all(
        (data.collection.items || []).slice(0, 24).map(async (item: NASAImage) => {
          try {
            const assetResponse = await fetch(
              `https://images-api.nasa.gov/asset/${item.data[0].nasa_id}`
            );
            const assetData = await assetResponse.json();
            
            // Find the highest quality image
            const images = assetData.collection.items.filter((asset: any) =>
              asset.href.match(/\.(jpg|jpeg|png)$/i)
            );
            const highResImage = images.find((img: any) => img.href.includes("~orig")) || 
                               images.find((img: any) => img.href.includes("~large")) ||
                               images[images.length - 1];
            
            return {
              ...item,
              highResUrl: highResImage?.href || item.links?.[0]?.href,
            };
          } catch {
            return {
              ...item,
              highResUrl: item.links?.[0]?.href,
            };
          }
        })
      );
      
      setImages(enhancedImages);
    } catch (error) {
      console.error("Error fetching NASA images:", error);
      toast.error("Failed to load images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(searchQuery);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchImages(searchQuery);
    }
  };

  const handleImageClick = (image: NASAImage) => {
    const imageData = image.data[0];
    const thumbnail = image.links?.[0]?.href || "";
    const highRes = image.highResUrl || thumbnail;
    
    navigate("/viewer", {
      state: {
        imageUrl: highRes,
        thumbnailUrl: thumbnail,
        title: imageData.title,
        description: imageData.description,
        nasaId: imageData.nasa_id,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 pt-28">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-aurora-gradient">
            NASA Image Gallery
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Discover and explore high-resolution space imagery
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for nebulas, planets, galaxies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-card border-border"
            />
          </form>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Image grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image, index) => {
              const imageData = image.data[0];
              const thumbnail = image.links?.[0]?.href || "";

              return (
                <Card
                  key={`${imageData.nasa_id}-${index}`}
                  className="group cursor-pointer overflow-hidden border-border hover:border-primary transition-all duration-300 hover:shadow-cosmic"
                  onClick={() => handleImageClick(image)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={thumbnail}
                        alt={imageData.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-semibold text-sm line-clamp-2">
                            {imageData.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(imageData.date_created).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No results */}
        {!loading && images.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No images found. Try a different search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
