import axios from "axios";

export interface Venue {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
}

export const getVenues = async (city: string, budget: number, vibe: string): Promise<Venue[]> => {
  const price = budget <= 50 ? "1,2" : budget <= 100 ? "2,3" : "3,4";
  const categories = mapVibeToYelpCategory(vibe);

  const response = await axios.get("https://api.yelp.com/v3/businesses/search", {
    headers: {
      Authorization: `Bearer ${process.env.YELP_API_KEY}`,
    },
    params: {
      location: city,
      price,
      categories,
      limit: 10,
    },
  });

  return response.data.businesses.map((biz: any) => ({
    id: biz.id,
    name: biz.name,
    category: biz.categories.map((cat: any) => cat.title).join(", "),
    distance: `${(biz.distance / 1609.34).toFixed(1)} miles`,
    rating: biz.rating,
  }));
};

const mapVibeToYelpCategory = (vibe: string): string => {
  const mapping: { [key: string]: string } = {
    Romantic: "romantic,restaurants",
    Chill: "cafes,coffee",
    Adventurous: "active,outdoor",
    Fun: "bars,entertainment",
  };
  return mapping[vibe] || "restaurants";
};
