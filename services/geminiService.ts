
import { MarketAnalysis, SignalType, NewsItem, BacktestReport } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const classifyError = (error: any) => {
  const msg = error.message?.toLowerCase() || "";
  const status = error.status;
  if (msg.includes("api key") || status === 400 || status === 401 || status === 403) return new Error("INVALID_API_KEY");
  if (status === 429 || msg.includes("quota") || msg.includes("limit")) return new Error("RATE_LIMIT_EXCEEDED");
  if (status >= 500) return new Error("SERVER_ERROR");
  return new Error("API_ERROR");
};

// Updated to use gemini-3-pro-preview for complex reasoning task (Backtesting).
export const simulateBacktest = async (pair: string, timeframe: string, strategy: string, startDate: string, endDate: string): Promise<BacktestReport> => {
  if (!process.env.API_KEY) throw new Error("MISSING_API_KEY");

  const prompt = `
    Perform a professional backtest simulation for ${pair} using the "${strategy}" strategy on the ${timeframe} timeframe from ${startDate} to ${endDate}.
    Based on general historical market knowledge, generate a realistic performance report.
    Return JSON with:
    {
      "netProfit": number,
      "winRate": number (0-100),
      "totalTrades": number,
      "maxDrawdown": number (percentage),
      "profitFactor": number,
      "equityCurve": Array<{name: string, value: number}> (approx 10 points representing growth over the period),
      "summary": "string explaining the results"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            netProfit: { type: Type.NUMBER },
            winRate: { type: Type.NUMBER },
            totalTrades: { type: Type.NUMBER },
            maxDrawdown: { type: Type.NUMBER },
            profitFactor: { type: Type.NUMBER },
            equityCurve: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                }
              }
            },
            summary: { type: Type.STRING }
          }
        }
      }
    });

    if (!response.text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(response.text);
  } catch (error) {
    throw classifyError(error);
  }
};

// Updated model selection to always use gemini-3-pro-preview.
// This ensures support for multimodal inputs and JSON response formatting (responseMimeType/responseSchema),
// which are not supported for nano banana models like gemini-2.5-flash-image.
export const analyzeMarket = async (pair: string, timeframe: string, imageBase64?: string): Promise<MarketAnalysis> => {
  if (!process.env.API_KEY) throw new Error("MISSING_API_KEY");
  const modelName = 'gemini-3-pro-preview';
  
  const systemInstruction = `You are a Tier-1 Institutional FX Analyst specialized in Smart Money Concepts (SMC) and ICT strategies. 
  Your goal is to provide HIGH-CONFIDENCE trading signals by identifying confluences of:
  1. Market Structure (BOS, CHoCH, Market Shift)
  2. Liquidity (SSL/BSL sweeps, Equal Highs/Lows)
  3. Order Blocks (OB) and Fair Value Gaps (FVG)
  4. Discount/Premium zones (Fib 0.5+)
  
  Be conservative. Only assign >80% confidence if at least 3 high-probability confluences are present. 
  Analyze ${pair} on the ${timeframe} timeframe.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      signal: { type: Type.STRING, enum: ["BUY", "SELL", "WAIT"] },
      entryPrice: { type: Type.NUMBER },
      stopLoss: { type: Type.NUMBER },
      takeProfit: { type: Type.ARRAY, items: { type: Type.NUMBER } },
      riskRewardRatio: { type: Type.STRING },
      confidence: { type: Type.NUMBER, description: "Confidence level between 0 and 100" },
      confluences: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING }, 
        description: "List of technical confluences (e.g. 'FVG fill', 'Liquidity Sweep', 'H4 Trend')" 
      },
      reasoning: { type: Type.STRING },
      indicators: {
        type: Type.OBJECT,
        properties: {
          rsi: { type: Type.NUMBER },
          macd: { type: Type.STRING },
          trend: { type: Type.STRING }
        }
      }
    },
    required: ["signal", "entryPrice", "stopLoss", "takeProfit", "confidence", "confluences", "reasoning"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: imageBase64 ? { 
        parts: [
          { inlineData: { mimeType: 'image/png', data: imageBase64 } }, 
          { text: `Analyze this chart for ${pair} on ${timeframe}. Look for liquidity sweeps and Order Blocks.` }
        ] 
      } : `Perform a deep technical analysis for ${pair} on ${timeframe}. Provide the most accurate signal possible based on institutional price action.`,
      config: { 
        systemInstruction, 
        responseMimeType: "application/json", 
        responseSchema,
        thinkingConfig: { thinkingBudget: 4000 } // Enable thinking for better reasoning
      }
    });

    const data = JSON.parse(response.text);
    return {
      pair, 
      timeframe, 
      signal: data.signal as SignalType, 
      entryPrice: data.entryPrice, 
      stopLoss: data.stopLoss,
      takeProfit: data.takeProfit || [0,0,0], 
      riskRewardRatio: data.riskRewardRatio || "1:2",
      confidence: data.confidence, 
      confluences: data.confluences || [],
      reasoning: data.reasoning,
      indicators: data.indicators || { rsi: 50, macd: "Neutral", trend: "Sideways" },
      timestamp: Date.now()
    };
  } catch (error) { 
    throw classifyError(error); 
  }
};

// gemini-2.5-flash-image is used for image generation via generateContent. Correct for nano banana models.
export const generateAvatar = async (description: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("MISSING_API_KEY");
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: `Generate a professional high-tech trading profile avatar: ${description}`,
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("No image generated");
};

// chatWithAI uses gemini-3-flash-preview for a basic support assistant task.
export const chatWithAI = async (message: string, history: any[]): Promise<string> => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    // Maintaining history context for the conversation.
    config: { 
        systemInstruction: "You are CNC Support Assistant. Help users with platform features, trading terminology, and account issues.",
    }
  });
  const response = await chat.sendMessage({ message });
  return response.text || "";
};

export const fetchMarketNews = async (): Promise<{news: NewsItem[], sources: string[]}> => {
  return {
    news: [
      { title: "USD/JPY Hits Fresh Highs as Yields Spike", source: "Bloomberg", time: "25m ago" },
      { title: "ECB President Lagarde Speaks on Inflation Outlook", source: "Reuters", time: "1h ago" },
      { title: "Gold (XAU/USD) Rejects $2400 Resistance Level", source: "FXStreet", time: "2h ago" }
    ],
    sources: ["https://www.bloomberg.com", "https://www.reuters.com"]
  };
};
