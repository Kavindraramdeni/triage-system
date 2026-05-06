import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let _client: GoogleGenerativeAI | null = null;
let _model: GenerativeModel | null = null;

function getClient(): GoogleGenerativeAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");
    _client = new GoogleGenerativeAI(apiKey);
  }
  return _client;
}

export function getTriageModel(): GenerativeModel {
  if (!_model) {
    _model = getClient().getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    });
  }
  return _model;
}
