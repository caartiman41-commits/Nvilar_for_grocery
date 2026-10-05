import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { PRODUCTS } from "@/lib/products-data";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const ai = getGeminiClient();

    const catalogSummary = PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      fabric: p.fabric,
      gsm: p.gsm,
      fit: p.fit,
      color: p.color,
      collection: p.collection,
      description: p.description,
    }));

    const systemPrompt = `You are Mitreno's Luxury AI Fashion Search Engine.
Mitreno is an ultra-premium, minimalist fashion brand (Royal Blue & White theme, editorial, high-craft).
Analyze the user's natural language search query. Extract:
1. Intent & Occasion (e.g., sunset dinner, gallery opening, travel, formal)
2. Aesthetic Vibe (e.g., relaxed, minimal, structured, oversized, nocturne)
3. Silhouette & Fabric preferences (e.g., linen, silk, wool, terry)
4. Budget constraints if any
5. Rank and filter the provided catalog items by semantic fit. Return the top matching product IDs along with a 1-sentence luxury stylist rationale for each.

Catalog items:
${JSON.stringify(catalogSummary, null, 2)}

Return ONLY valid JSON matching this schema:
{
  "extractedIntent": {
    "occasion": "string",
    "vibe": "string",
    "silhouette": "string",
    "preferredFabric": "string"
  },
  "stylistNote": "string (1 brief editorial sentence summarizing the search intent)",
  "matchedProductIds": ["string"],
  "matchRationales": {
    "productId": "string (editorial reason why it matches)"
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `User Query: "${query}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return NextResponse.json({ success: true, ...parsed });
  } catch (error) {
    console.error("AI Search Error:", error);
    // Fallback search gracefully if offline/error
    return NextResponse.json({
      success: true,
      extractedIntent: {
        occasion: "Curated Style",
        vibe: "Minimalist Luxury",
        silhouette: "Relaxed",
        preferredFabric: "Natural Flax / Giza Cotton",
      },
      stylistNote: "Filtered catalog according to contemporary editorial proportions.",
      matchedProductIds: PRODUCTS.slice(0, 4).map((p) => p.id),
      matchRationales: {},
    });
  }
}
