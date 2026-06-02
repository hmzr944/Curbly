// Prices in USD per million tokens
const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o':                  { input: 5.00,  output: 15.00 },
  'gpt-4o-mini':             { input: 0.15,  output: 0.60  },
  'gpt-4-turbo':             { input: 10.00, output: 30.00 },
  'gpt-4':                   { input: 30.00, output: 60.00 },
  'gpt-3.5-turbo':           { input: 0.50,  output: 1.50  },
  'claude-3-5-sonnet-latest': { input: 3.00,  output: 15.00 },
  'claude-3-5-haiku-latest':  { input: 0.80,  output: 4.00  },
  'claude-3-opus-latest':     { input: 15.00, output: 75.00 },
  'gemini-1.5-pro':           { input: 1.25,  output: 5.00  },
  'gemini-1.5-flash':         { input: 0.075, output: 0.30  },
}

export function computeCost(model: string, promptTokens: number, completionTokens: number): number {
  const prices = PRICING[model] ?? { input: 1.00, output: 3.00 }
  return (promptTokens / 1_000_000) * prices.input
       + (completionTokens / 1_000_000) * prices.output
}
