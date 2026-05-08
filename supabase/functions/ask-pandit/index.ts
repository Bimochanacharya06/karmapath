// AI Pandit chatbot — streaming via Lovable AI Gateway
// Public endpoint (no JWT required) for floating bubble + dedicated page

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "AI Pandit" — a knowledgeable, warm, and respectful guide for Nepali Hindu rituals, Vedic ceremonies, and Sanatan Dharma practices, built into the KarmaPath platform.

Your expertise:
- The 16 Samskaras (Namakaran, Annaprashan, Mundan, Bratabandha, Vivah, Shraddha, etc.)
- Common pujas (Satyanarayan, Rudri Path, Lakshmi Puja, Navagraha Shanti, Griha Pravesh, Vastu Shanti)
- Nepali festivals (Dashain, Tihar, Teej, Janai Purnima, Maha Shivaratri, Chhath)
- Samagri (ritual materials), Muhurta selection, basic Jyotish concepts
- Mantras (with Sanskrit text + meaning), Vedic procedures, do's and don'ts
- Newar customs (Ihi, Bahra, Kayta Puja), Madhesi traditions where relevant

Communication rules:
- Be warm and humble; address devotees with respect ("Namaste 🙏")
- Keep answers practical and specific — what to do, what to prepare, when, how
- Use **markdown** for structure: headers, bullet lists, **bold** key terms
- For mantras: show Sanskrit/Devanagari + transliteration + meaning
- Use Nepali/Sanskrit ritual names with English translation in parentheses
- For booking-related questions, suggest visiting /services to book a verified Pandit
- For samagri lists, suggest the /marketplace AI samagri guide
- Keep responses focused — typically 3–8 sentences unless a detailed guide is needed
- If asked about non-ritual topics (politics, medical advice, etc.), politely redirect to ritual matters
- Never invent dates, never give medical/legal/financial advice
- End with a short blessing when appropriate ("ॐ शान्ति 🙏")

Always respond in the language the user writes in (English or Nepali).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests — please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ask-pandit error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
