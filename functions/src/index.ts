import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";
import axios from "axios";
import {generateDateIdea} from "./services/openaiService";
import {getVenues} from "./services/yelpService";

admin.initializeApp();

// Environment vars set via firebase functions:config:set
process.env.OPENAI_API_KEY = functions.config().openai.key;
process.env.YELP_API_KEY = functions.config().yelp.key;

const corsHandler = cors({origin: true});

export const generateDatePlan = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const {city, budget, vibe} = req.body;
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).send("Unauthorized: No Spotify token provided.");
    }

    // Validate Spotify token and fetch user profile to ensure token is valid
    let userProfile: any;
    try {
      const profileRes = await axios.get("https://api.spotify.com/v1/me", {
        headers: {Authorization: `Bearer ${token}`},
      });
      userProfile = profileRes.data;
    } catch (error: any) {
      console.error("Spotify token validation failed:", error.response?.data || error.message);
      return res.status(401).send("Unauthorized: Invalid or expired Spotify token.");
    }

    // Fetch user's top artists and tracks to determine music preferences
    let topArtists: any[] = [];
    let topTracks: any[] = [];

    try {
      const [artistsRes, tracksRes] = await Promise.all([
        axios.get("https://api.spotify.com/v1/me/top/artists?limit=10", {
          headers: {Authorization: `Bearer ${token}`},
        }),
        axios.get("https://api.spotify.com/v1/me/top/tracks?limit=10", {
          headers: {Authorization: `Bearer ${token}`},
        }),
      ]);

      topArtists = artistsRes.data.items || [];
      topTracks = tracksRes.data.items || [];
    } catch (error: any) {
      console.error("Failed to fetch Spotify top data:", error.response?.data || error.message);
      // Not a user auth error, but a fetch error. Return 500 as we can't continue without preferences.
      return res.status(500).send("Error fetching user music preferences from Spotify.");
    }

    // Extract genres from top artists
    const genreCount: { [key: string]: number } = {};
    for (const artist of topArtists) {
      if (artist.genres && artist.genres.length > 0) {
        for (const g of artist.genres) {
          genreCount[g] = (genreCount[g] || 0) + 1;
        }
      }
    }

    // Sort genres by frequency
    const sortedGenres = Object.keys(genreCount).sort((a, b) => genreCount[b] - genreCount[a]);
    let sharedPreferences = "indie, jazz"; // default fallback

    if (sortedGenres.length > 0) {
      sharedPreferences = sortedGenres.slice(0, 3).join(", ");
    }

    // Construct OpenAI prompt 
    const prompt = `Two users in ${city} with a $${budget} budget and shared love for ${sharedPreferences}
     want a whimsical date plan. Their vibe is "${vibe}". Suggest:
- A main activity (e.g., concert, museum, walk).
- A restaurant in close proximity, matching their vibe.
- Include fun, creative elements (e.g., barefoot park stroll, themed selfie spot).
- End with a playful question like, "Shall I book the tickets for you?"`;

    try {
      const idea = await generateDateIdea(prompt);
      const venues = await getVenues(city, budget, vibe);
      return res.json({idea, venues});
    } catch (error: any) {
      console.error("Error generating date plan or fetching venues:", error.response?.data || error.message);
      return res.status(500).send("Error generating date plan");
    }
  });
});
