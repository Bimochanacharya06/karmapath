import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pujaType } = await req.json();
    if (!pujaType || typeof pujaType !== "string") {
      return new Response(JSON.stringify({ error: "pujaType is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a highly experienced Hindu Purohit (पुरोहित) from Nepal with 40+ years of Karmakanda expertise. You have deep knowledge of every ritual item (samagri/सामग्री) needed for Vedic ceremonies as practiced in Nepal.

When given a puja or ritual type, provide a COMPREHENSIVE and DETAILED samagri list that a family can use as a shopping checklist. For each item include:
- name: Common English name
- nameNepali: The Nepali/Devanagari name families would use when buying from a local shop
- category: One of "flowers", "grains", "oils", "fabrics", "metals", "fruits", "spices", "sacred", "other"
- description: Explain the item's specific PURPOSE in this particular ritual (e.g., "Offered to Agni during the 5th round of Saptapadi" not just "Used in puja"). Be specific to the ceremony.
- quantity: Recommended quantity with unit (e.g., "1 mana", "5 pieces", "1 packet", "250g")
- estimatedPriceNPR: Realistic current market price in Nepali Rupees
- essential: true if the ritual CANNOT proceed without it, false if it enhances but is optional
- whereToFind: Where to buy it in Nepal (e.g., "Any puja pasal", "Asan Bazaar", "Local flower vendor")

Include 15-25 items. Group essential items first. Include small but crucial items families often forget (like sindhoor, janai, supari, coins, etc). Prices should reflect 2024-2025 Nepal market rates.`
          },
          {
            role: "user",
            content: `I need a complete samagri shopping list for: ${pujaType}. Please include every item a family needs, including the small things people often forget.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_samagri_list",
              description: "Return the comprehensive list of samagri items for a puja",
              parameters: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        nameNepali: { type: "string" },
                        category: { type: "string", enum: ["flowers", "grains", "oils", "fabrics", "metals", "fruits", "spices", "sacred", "other"] },
                        description: { type: "string" },
                        quantity: { type: "string" },
                        estimatedPriceNPR: { type: "number" },
                        essential: { type: "boolean" },
                        whereToFind: { type: "string" }
                      },
                      required: ["name", "nameNepali", "category", "description", "quantity", "estimatedPriceNPR", "essential", "whereToFind"]
                    }
                  }
                },
                required: ["items"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_samagri_list" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed.items), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend-samagri error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
