import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { PRODUCTS } from "@/lib/products-data";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    const anchorProduct = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];

    const catalogSummary = PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      fabric: p.fabric,
      fit: p.fit,
      color: p.color,
      collection: p.collection,
    }));

    const ai = getGeminiClient();

    const prompt = `You are Mitreno's Senior Editorial Stylist and AI Outfit Architect.
Anchor Garment:
${JSON.stringify(anchorProduct, null, 2)}

Full Catalog:
${JSON.stringify(catalogSummary, null, 2)}

Generate 3 distinct high-fashion looks styling this anchor garment:
- Look 01: Coastal Sunset / Resort Ease (Casual luxury)
- Look 02: Gallery Opening / After Dark (Sharp contemporary)
- Look 03: Architectural Minimalist / Daytime (Structured everyday)

For each look, pick complementary product IDs from the catalog, write a title, a short mood description, and an editorial styling directive.

Return ONLY JSON:
{
  "anchorProductId": "${anchorProduct.id}",
  "looks": [
    {
      "lookNumber": "LOOK 01",
      "name": "string (e.g. Coastal Riviera Dusk)",
      "vibe": "string",
      "description": "string (2-3 sentences)",
      "itemIds": ["string"],
      "stylingTip": "string"
    },
    {
      "lookNumber": "LOOK 02",
      "name": "string (e.g. Nocturne Gallery Opening)",
      "vibe": "string",
      "description": "string",
      "itemIds": ["string"],
      "stylingTip": "string"
    },
    {
      "lookNumber": "LOOK 03",
      "name": "string (e.g. Minimalist Studio Atelier)",
      "vibe": "string",
      "description": "string",
      "itemIds": ["string"],
      "stylingTip": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return NextResponse.json({ success: true, ...parsed });
  } catch (error) {
    console.error("Outfit Builder Error:", error);
    return NextResponse.json({
      success: true,
      anchorProductId: PRODUCTS[0].id,
      looks: [
        {
          lookNumber: "LOOK 01",
          name: "Mediterranean Riviera Dusk",
          vibe: "Relaxed Linen Elegance",
          description: "Unbuttoned collar paired with high-waist pleated trousers for effortless seaside dinners.",
          itemIds: ["afz-001", "afz-002", "afz-006", "afz-008"],
          stylingTip: "Leave the top two buttons open and fold the cuffs once to highlight the sterling cuff.",
        },
        {
          lookNumber: "LOOK 02",
          name: "Nocturne Gallery Opening",
          vibe: "Tonal Sculptural Monochrome",
          description: "Layered beneath our deconstructed silk blazer to create high textural contrast.",
          itemIds: ["afz-001", "afz-003", "afz-002", "afz-006"],
          stylingTip: "Keep accessories discreet; let the silk sheen anchor the ambient gallery lighting.",
        },
        {
          lookNumber: "LOOK 03",
          name: "Minimalist Modernist Atelier",
          vibe: "Architectural Studio Focus",
          description: "Balanced proportions pairing dense European flax with wide-leg drape.",
          itemIds: ["afz-001", "afz-005", "afz-002"],
          stylingTip: "French tuck the front hem to emphasize the double pleat waistband architecture.",
        },
      ],
    });
  }
}
