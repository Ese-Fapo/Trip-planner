export const SelectTravelList = [
    {
        id: 1,
        title: "Solo Explorer",
        desc: "Perfect for independent travelers who love flexibility and self-paced adventures.",
        icon: "🧭",
        people: "1 person",
    },
    {
        id: 2,
        title: "Couple Getaway",
        desc: "Romantic escapes with cozy stays, great food, and memorable shared experiences.",
        icon: "💑",
        people: "2 people",
    },
    {
        id: 3,
        title: "Family Trip",
        desc: "Kid-friendly attractions, comfortable accommodation, and balanced activity plans.",
        icon: "👨‍👩‍👧‍👦",
        people: "3 to 6 people",
    },
    {
        id: 4,
        title: "Friends Adventure",
        desc: "Group fun with lively activities, social spots, and shareable experiences.",
        icon: "🧑‍🤝‍🧑",
        people: "2 to 10 people",
    },
    {
        id: 5,
        title: "Business + Leisure",
        desc: "Efficient plans for work trips with time carved out for exploration.",
        icon: "💼",
        people: "1 to 3 people",
    },
    {
        id: 6,
        title: "Adventure Crew",
        desc: "Outdoor-focused itineraries for hiking, nature escapes, and thrilling activities.",
        icon: "🏕️",
        people: "2 to 8 people",
    },
];

export const SelectBudgetOptions = [
    {
        id: 1,
        title: "Budget-Friendly",
        desc: "Affordable stays, local transport, and wallet-friendly food options.",
        icon: "💸",
    },
    {
        id: 2,
        title: "Moderate",
        desc: "A balanced mix of comfort and value with mid-range hotels and activities.",
        icon: "💰",
    },
    {
        id: 3,
        title: "Luxury",
        desc: "Premium hotels, private transfers, and exclusive experiences.",
        icon: "💎",
    },
];

export const AI_PROMPT = `Create a detailed travel plan in valid JSON only (no markdown, no extra text).

Trip request:
- Destination: {location}
- Duration: {days} days
- Travelers: {travelers}
- Budget style: {budget}

Return this exact top-level JSON shape:
{
    "tripSummary": {
        "destination": "string",
        "durationDays": number,
        "budget": "string",
        "travelers": "string",
        "bestTimeToVisit": "string",
        "estimatedTotalCost": "string",
        "tips": ["string"]
    },
    "hotelOptions": [
        {
            "name": "string",
            "area": "string",
            "pricePerNight": "string",
            "rating": number,
            "description": "string"
        }
    ],
    "itinerary": [
        {
            "day": number,
            "theme": "string",
            "activities": [
                {
                    "time": "string",
                    "title": "string",
                    "description": "string",
                    "estimatedCost": "string"
                }
            ]
        }
    ]
}`;