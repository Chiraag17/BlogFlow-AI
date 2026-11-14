/**
 * Centralized Google Gemini AI Service
 *
 * Provides a unified, resilient interface to Google's Gemini models using the official @google/genai SDK.
 * Features:
 * - Default model: gemini-4-hydrogen (configurable via GEMINI_MODEL)
 * - Compliant SDK headers (User-Agent: aistudio-build)
 * - Automatic omission of deprecated sampling params (temperature) for Gemini 4 models
 * - Exponential backoff retry & timeout protection
 * - Structured JSON parsing and validation
 */

import { GoogleGenAI } from '@google/genai';

export interface GeminiGenerateOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: 'text/plain' | 'application/json';
  timeoutMs?: number;
  retries?: number;
}

export class GeminiService {
  private apiKey: string;
  private defaultModel: string;
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.defaultModel = process.env.GEMINI_MODEL || 'gemini-4-hydrogen';

    if (this.isConfigured()) {
      try {
        this.aiClient = this.createClient();
      } catch (err) {
        console.error('Failed to initialize Google Gen AI client:', err);
      }
    }
  }

  private createClient(): GoogleGenAI {
    return new GoogleGenAI({
      apiKey: this.apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  /** Check if the Gemini API key is configured */
  public isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY || this.apiKey || '';
    return Boolean(key && key.trim().length > 0 && !key.includes('your_'));
  }

  /** Get the configured model name */
  public getModelName(): string {
    return this.defaultModel;
  }

  /**
   * Generates text content with automatic retries and timeout protection.
   */
  public async generateText(options: GeminiGenerateOptions): Promise<string> {
    const {
      prompt,
      systemInstruction,
      temperature,
      maxOutputTokens = 4096,
      responseMimeType = 'text/plain',
      timeoutMs = 60000,
      retries = 3,
    } = options;

    this.apiKey = process.env.GEMINI_API_KEY || this.apiKey;
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured.');
    }

    if (!this.aiClient) {
      this.aiClient = this.createClient();
    }

    let attempt = 0;
    let lastError: any = null;

    while (attempt < retries) {
      attempt++;
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini API request timed out after ${timeoutMs}ms`)), timeoutMs)
        );

        const config: Record<string, any> = {
          maxOutputTokens,
        };

        // Gemini 4 models deprecate temperature/topP/topK — only attach for non-Gemini-4 models
        const isGemini4 = this.defaultModel.startsWith('gemini-4');
        if (!isGemini4 && typeof temperature === 'number') {
          config.temperature = temperature;
        }

        if (systemInstruction) {
          config.systemInstruction = systemInstruction;
        }

        if (responseMimeType === 'application/json') {
          config.responseMimeType = 'application/json';
        }

        const requestPromise = this.aiClient.models.generateContent({
          model: this.defaultModel,
          contents: prompt,
          config,
        });

        const response: any = await Promise.race([requestPromise, timeoutPromise]);
        const text = response?.text || '';

        if (!text || text.trim().length === 0) {
          throw new Error('Empty response received from Gemini model.');
        }

        return text;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);

        if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('401') || errMsg.includes('invalid api key')) {
          throw new Error('Invalid Gemini API Key. Please verify your GEMINI_API_KEY configuration.');
        }

        if (attempt < retries) {
          const delayMs = Math.pow(2, attempt) * 500;
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }
    }

    throw new Error(`Gemini generation failed after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Generates and parses a structured JSON response from Gemini.
   */
  public async generateStructuredJson<T>(
    options: Omit<GeminiGenerateOptions, 'responseMimeType'> & {
      validator?: (data: any) => { valid: boolean; error?: string };
    }
  ): Promise<T> {
    const rawText = await this.generateText({
      ...options,
      responseMimeType: 'application/json',
    });

    let cleaned = rawText.trim();

    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    try {
      const parsed = JSON.parse(cleaned);

      if (options.validator) {
        const check = options.validator(parsed);
        if (!check.valid) {
          throw new Error(`Structured output validation failed: ${check.error}`);
        }
      }

      return parsed as T;
    } catch (parseError: any) {
      throw new Error(
        `Failed to parse structured JSON from Gemini output: ${parseError.message}\nRaw text: ${cleaned.slice(0, 300)}...`
      );
    }
  }
}

export const geminiService = new GeminiService();
