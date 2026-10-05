import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { PRODUCTS } from "@/lib/products-data";

export async function POST(req: NextRequest) {
  try {
    const { messages, currentProductId } = await req.json();

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
    }));

    const ai = getGeminiClient();

    const systemPrompt = `You are Mitreno AI — the Private Style Concierge and Fashion House Director for Mitreno.
Brand Identity:
- Luxury / Minimalist / Editorial / High-Craft
- Primary colors: Royal Blue & White. Clean lines, zero discount hype.
- Tone: Sophisticated, knowledgeable, concise, respectful, artistic, and attentive.
- Never use cheesy emojis or sales-pitch hype. Speak like a Parisian luxury maison director or Savile Row master tailor.

Available Catalog:
${JSON.stringify(catalogSummary, null, 2)}

${currentProductId ? `The user is currently viewing product ID: ${currentProductId}` : ""}

When the user asks for styling advice, outfit recommendations, fabric queries, or fit guidance:
1. Provide polished, direct, insightful editorial advice.
2. If relevant, recommend 1 to 3 matching product IDs from the catalog.
3. Suggest an action button (e.g. "View Look", "View Linen Edit", "Add to Bag").

Return ONLY JSON:
{
  "replyText": "string (the conversational response formatted elegantly)",
  "recommendedProductIds": ["string"],
  "suggestedAction": {
    "label": "string",
    "type": "try_on" | "view_product" | "discover" | "open_wardrobe",
    "targetId": "string"
  }
}`;

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return NextResponse.json({ success: true, ...parsed });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({
      success: true,
      replyText: "For an understated luxury presence, I recommend balancing our 240 GSM Structured Linen Shirt with the Double-Pleated Monochrome Trousers. This creates a sculptural, relaxed silhouette ideal for both warm afternoons and evening gatherings.",
      recommendedProductIds: ["afz-001", "afz-002", "afz-006"],
      suggestedAction: {
        label: "View Complete Look",
        type: "view_product",
        targetId: "afz-001",
      },
    });
  }
}
