import { useState, useEffect } from "react";

interface NasaItem {
  data: {
    title: string;
    nasa_id: string;
  }[];
  links?: {
    href: string;
    render: string;
  }[];
}

interface NasaApiResponse {
  collection: {
    items: NasaItem[];
  };
}

const NasaSearch = () => {
  const [searchTerm, setSearchTerm] = useState("Earth"); // default planet
  const [images, setImages] = useState<NasaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      // Only fetch images
      const res = await fetch(
        `https://images-api.nasa.gov/search?q=${query}&media_type=image`
      );
      if (!res.ok) throw new Error("Failed to fetch NASA images");
      const data: NasaApiResponse = await res.json();

      // Optional: filter further by title containing planet keyword
      const planetImages = data.collection.items.filter((item) =>
        item.data[0].title.toLowerCase().includes(query.toLowerCase())
      );

      setImages(planetImages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(searchTerm); // Fetch default planet images on load
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 px-4 md:px-16 transition-colors duration-300">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-white">
        Search NASA Planet Images
      </h1>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12">
        <input
          type="text"
          placeholder="Enter planet name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-5 py-3 rounded-lg border border-border shadow-md focus:outline-none focus:ring-2 focus:ring-primary bg-gray-900 text-white placeholder-gray-400 transition"
        />
        <button
          onClick={() => fetchImages(searchTerm)}
          className="px-8 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-glow transition"
        >
          Search
        </button>
      </div>

      {/* Status */}
      {loading && (
        <p className="text-center text-lg text-white font-medium">Loading...</p>
      )}
      {error && (
        <p className="text-center text-lg text-red-400 font-medium">{error}</p>
      )}
      {!loading && images.length === 0 && !error && (
        <p className="text-center text-lg text-gray-300 font-medium">
          No planet images found.
        </p>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((item, idx) => {
          const imageUrl = item.links?.[0]?.href || "";
          return (
            <div
              key={idx}
              className="border border-border rounded-lg overflow-hidden shadow hover:shadow-lg transition bg-gray-800"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.data[0]?.title || "NASA Image"}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-700 flex items-center justify-center text-gray-300">
                  No Image
                </div>
              )}
              <div className="p-3 text-sm font-medium text-center text-white">
                {item.data[0]?.title || "Untitled"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NasaSearch;
