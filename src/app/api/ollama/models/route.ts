import { NextResponse } from 'next/server';
import { OLLAMA_MODELS } from '@/lib/ollama-models';

export async function GET() {
  return NextResponse.json({
    models: OLLAMA_MODELS,
    total: OLLAMA_MODELS.length,
  });
}
