import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.0-flash"];
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const cleanJsonResponse = (text) => {
  if (!text) return "";

  return String(text)
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
};

const extractPromptValue = (prompt, label, fallback) => {
  const match = prompt.match(new RegExp(`- ${label}: (.*)`, "i"));
  return match?.[1]?.trim() || fallback;
};

const buildFallbackTripPlan = (prompt) => {
  const destination = extractPromptValue(prompt, "Destination", "Your destination");
  const durationDays = Number.parseInt(extractPromptValue(prompt, "Duration", "3"), 10) || 3;
  const travelers = extractPromptValue(prompt, "Travelers", "1 person");
  const budget = extractPromptValue(prompt, "Budget style", "Moderate");

  const budgetKey = budget.toLowerCase();
  const estimatedTotalCost = budgetKey.includes("lux")
    ? "$1800 - $3200"
    : budgetKey.includes("budget")
      ? "$400 - $900"
      : "$900 - $1600";

  const hotelOptions = [
    {
      name: `${destination} Central Stay`,
      area: "City Center",
      pricePerNight: budgetKey.includes("lux") ? "$220" : budgetKey.includes("budget") ? "$80" : "$140",
      rating: 4.5,
      description: "A well-located stay with easy access to top attractions and food spots.",
    },
    {
      name: `${destination} Comfort Suites`,
      area: "Popular Visitor District",
      pricePerNight: budgetKey.includes("lux") ? "$280" : budgetKey.includes("budget") ? "$95" : "$165",
      rating: 4.3,
      description: "Comfortable rooms, reliable service, and a convenient base for exploring the city.",
    },
  ];

  const itinerary = Array.from({ length: durationDays }, (_, index) => ({
    day: index + 1,
    theme:
      index === 0
        ? "Arrival and local highlights"
        : index === durationDays - 1
          ? "Relaxed wrap-up and departure"
          : "Explore top attractions and local food",
    activities: [
      {
        time: "Morning",
        title: `Discover ${destination}`,
        description: "Start with a scenic walk and visit a top landmark or cultural site.",
        estimatedCost: budgetKey.includes("lux") ? "$60" : "$25",
      },
      {
        time: "Afternoon",
        title: "Lunch and neighborhood exploration",
        description: "Try a local restaurant and spend time in a lively district or market.",
        estimatedCost: budgetKey.includes("lux") ? "$75" : "$30",
      },
      {
        time: "Evening",
        title: "Relaxed dinner and photo spots",
        description: "Wind down with a well-rated dinner spot and an easy evening activity.",
        estimatedCost: budgetKey.includes("lux") ? "$90" : "$35",
      },
    ],
  }));

  return {
    tripSummary: {
      destination,
      durationDays,
      budget,
      travelers,
      bestTimeToVisit: "Spring or autumn for pleasant weather and lighter crowds",
      estimatedTotalCost,
      tips: [
        "Book accommodation early for better prices.",
        "Keep one flexible block each day for rest or spontaneous plans.",
        "If live AI is unavailable, this local sample itinerary keeps the planner usable.",
      ],
    },
    hotelOptions,
    itinerary,
  };
};

const getStatusCode = (error) =>
  Number(
    error?.status ||
      error?.code ||
      error?.response?.status ||
      error?.error?.code,
  ) || null;

const isRetryableError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  const statusCode = getStatusCode(error);

  return (
    (statusCode && RETRYABLE_STATUS_CODES.has(statusCode)) ||
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand")
  );
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestTripPlan = async (prompt) => {
  let lastError;

  for (const model of MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const rawText =
          typeof response?.text === "function" ? await response.text() : response?.text;
        const cleaned = cleanJsonResponse(rawText);

        if (cleaned) {
          return JSON.parse(cleaned);
        }

        throw new Error("Empty AI response.");
      } catch (error) {
        lastError = error;

        if (!isRetryableError(error)) {
          throw error;
        }

        if (attempt < 2) {
          await wait(700 * attempt);
        }
      }
    }
  }

  throw lastError || new Error("AI service is temporarily unavailable.");
};

export const generateTripPlan = async (prompt) => {
  if (!ai) {
    return buildFallbackTripPlan(prompt);
  }

  try {
    return await requestTripPlan(prompt);
  } catch (error) {
    console.warn("Gemini API unavailable, using local fallback itinerary.", error);
    return buildFallbackTripPlan(prompt);
  }
};


