/* =========================================================
   OPENAI MODERATION ENGINE
   Sends Reddit content to OpenAI for AI scoring
========================================================= */

export async function runOpenAIScoring(
  title: string,
  body: string,
  apiKey: string
) {

  console.log(
    "🚀 OPENAI MODERATION ENGINE STARTED"
  );

  console.log(
    "📝 TITLE:",
    title || "No Title"
  );

  console.log(
    "📄 BODY LENGTH:",
    body?.length || 0
  );

  /* =========================================================
     SAFETY CHECK
  ========================================================= */

  if (!apiKey) {

    console.error(
      "❌ OPENAI API KEY MISSING"
    );

    return fallback(
      "Missing OpenAI API key"
    );
  }

  try {

    /* =========================================================
       OPENAI API REQUEST
    ========================================================= */

    console.log(
      "📡 SENDING REQUEST TO OPENAI"
    );

    const res = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify({

          model: "gpt-4o-mini",

          response_format: {
            type: "json_object",
          },

          messages: [

            /* =========================
               SYSTEM PROMPT
            ========================= */

            {
              role: "system",

              content: `
You are a Reddit cooking moderation AI.

Analyze recipe-related Reddit posts.

Return ONLY valid JSON:

{
  "score": number,
  "confidence": number,
  "status": "GOOD" | "FAIR" | "BAD",
  "reason": string,
  "flags": string[]
}
`,
            },

            /* =========================
               USER CONTENT
            ========================= */

            {
              role: "user",

              content:
`TITLE: ${title || "No Title"}

BODY: ${body || "No Body"}`
            },
          ],

          temperature: 0.15,
        }),
      }
    );

    /* =========================================================
       RESPONSE STATUS CHECK
    ========================================================= */

    console.log(
      "📥 OPENAI RESPONSE STATUS:",
      res.status
    );

    if (!res.ok) {

      console.error(
        "❌ OPENAI HTTP ERROR:",
        res.status
      );

      return fallback(
        `HTTP ${res.status}`
      );
    }

    /* =========================================================
       SAFE JSON RESPONSE PARSE
    ========================================================= */

    const data: any =
      await res.json();

    console.log(
      "🧠 RAW OPENAI RESPONSE:",
      JSON.stringify(
        data,
        null,
        2
      )
    );

    /* =========================================================
       SAFE CONTENT EXTRACTION
    ========================================================= */

    const rawContent:
      string | undefined =
        data?.choices?.[0]
          ?.message?.content;

    if (!rawContent) {

      console.error(
        "❌ EMPTY AI CONTENT"
      );

      return fallback(
        "Empty AI response"
      );
    }

    console.log(
      "📄 RAW AI CONTENT:",
      rawContent
    );

    /* =========================================================
       CLEAN MARKDOWN JSON
    ========================================================= */

    const cleaned =
      rawContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    console.log(
      "🧹 CLEANED AI RESPONSE:",
      cleaned
    );

    /* =========================================================
       SAFE JSON PARSE
    ========================================================= */

    let parsed: any;

    try {

      parsed =
        JSON.parse(cleaned);

      console.log(
        "✅ AI JSON PARSE SUCCESS"
      );

    } catch (err) {

      console.error(
        "❌ JSON PARSE FAILURE:",
        err
      );

      return fallback(
        "JSON parse failure"
      );
    }

    /* =========================================================
       SCORE NORMALIZATION
    ========================================================= */

    let score =
      Number(parsed?.score);

    if (isNaN(score)) {

      console.warn(
        "⚠️ INVALID SCORE DETECTED"
      );

      score = 55;
    }

    score =
      Math.max(
        0,
        Math.min(100, score)
      );

    /* =========================================================
       CONFIDENCE NORMALIZATION
    ========================================================= */

    let confidence =
      Number(parsed?.confidence);

    if (isNaN(confidence)) {

      console.warn(
        "⚠️ INVALID CONFIDENCE DETECTED"
      );

      confidence = 0.5;
    }

    confidence =
      Math.max(
        0,
        Math.min(1, confidence)
      );

    /* =========================================================
       STATUS GENERATION
    ========================================================= */

    const status =
      score >= 75
        ? "GOOD"
        : score >= 45
        ? "FAIR"
        : "BAD";

    /* =========================================================
       FINAL RESULT
    ========================================================= */

    const result = {

      score,

      confidence,

      status,

      reason:
        parsed?.reason ??
        "AI analysis completed",

      flags:
        Array.isArray(parsed?.flags)
          ? parsed.flags
          : ["No Issues"],

      source: "openai",
    };

    console.log(
      "📊 FINAL OPENAI RESULT:",
      result
    );

    console.log(
      "✅ OPENAI MODERATION COMPLETE"
    );

    return result;

  } catch (err) {

    console.error(
      "❌ OPENAI ENGINE FAILURE:",
      err
    );

    return fallback(
      "OpenAI request failed"
    );
  }
}

/* =========================================================
   FALLBACK ENGINE
   Used when OpenAI fails
========================================================= */

function fallback(reason: string) {

  console.log(
    "⚠️ FALLBACK ENGINE ACTIVATED:",
    reason
  );

  return {

    score: 55,

    confidence: 0.4,

    status: "FAIR",

    reason,

    flags: ["Fallback Analysis Active"],

    source: "fallback",
  };
}
