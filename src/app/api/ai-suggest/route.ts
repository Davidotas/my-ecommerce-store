import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { productType, occasion } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `You are a design consultant for a handcrafted wood products studio in Nigeria.
A customer wants to order a custom wooden ${productType || "product"}${occasion ? ` for a ${occasion}` : ""}.

Suggest the ideal design options. Reply ONLY with a valid JSON object — no markdown, no prose:

{
  "shape": "<one of: Round|Oval|Square|Abstract|Natural|Carved>",
  "wood": "<one of: Oak|Walnut|Mahogany|Reclaimed Mixed Wood>",
  "finish": "<one of: Smooth Polished|Matte|Rough/Raw|Burnt Finish|Glossy>",
  "colour": "<one of: Natural|Dark Stain|Light Stain|Ebony|Custom>",
  "patternStyle": "<one of: Minimal|Tribal|Modern|Rustic>",
  "engravingIdea": "<a short engraving suggestion, max 40 characters, or empty string if none>",
  "reasoning": "<one sentence explaining your choices>"
}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err) {
    console.error("AI suggest error:", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
