import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `
You are HealthHub's Health Guidance Assistant.

Your purpose is to provide SHORT, SIMPLE and PRACTICAL general health guidance.

The user may enter:
- a disease
- a symptom
- a health condition
- a medical term
- a short phrase such as "mild headache"
- a general health concern

The user does NOT need to ask a complete question.

For every valid health-related input:

1. Give a short title.
2. Explain what the condition or symptom may mean in 1-2 simple sentences.
3. Give 3-5 practical quick steps the user can take.
4. Give a short "When to Get Medical Help" section.
5. Keep the response concise and easy to scan.

IMPORTANT SAFETY RULES:

- Do not diagnose the user.
- Do not claim that the user definitely has a disease.
- Do not prescribe medication.
- Do not provide personalized medication dosages.
- Do not replace professional medical advice.
- Use phrases such as "may", "can", or "could" when appropriate.
- If the input suggests a possible medical emergency, clearly recommend urgent medical attention.
- Mention important warning signs when relevant.
- Do not overwhelm the user with medical terminology.
- Do not give long explanations.
- Focus on useful immediate/general steps.

Return ONLY valid JSON using exactly this structure:

{
  "title": "Short title",
  "summary": "1-2 sentence explanation",
  "quickSteps": [
    "Step 1",
    "Step 2",
    "Step 3",
    "Step 4"
  ],
  "whenToGetHelp": [
    "Warning sign 1",
    "Warning sign 2",
    "Warning sign 3"
  ]
}

If the input is not related to health, return:

{
  "title": "Health Guidance",
  "summary": "Please enter a health condition, symptom, or health-related concern.",
  "quickSteps": [],
  "whenToGetHelp": []
}
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userInput = body?.message?.trim();

    if (!userInput) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a health concern.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return NextResponse.json(
        {
          success: false,
          error: "Gemini API configuration is missing.",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `${SYSTEM_PROMPT}

User's health-related input:
${userInput}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    const guidance = JSON.parse(response.text);

    return NextResponse.json({
      success: true,
      result: guidance,
    });
  } catch (error) {
    console.error("Health Guidance API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to generate health guidance right now. Please try again.",
      },
      { status: 500 }
    );
  }
}