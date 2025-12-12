import { NextRequest, NextResponse } from 'next/server'

/**
 * Translate text from French to English
 * Uses MyMemory Translation API (free, no API key required)
 */
export async function POST(request: NextRequest) {
  try {
    const { text, from = 'fr', to = 'en' } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // If text is empty, return empty string
    if (text.trim().length === 0) {
      return NextResponse.json({ translatedText: '' })
    }

    // Use MyMemory Translation API (free, no API key required)
    const translatedText = await translateWithLibreTranslate(text, from, to)

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Translate using MyMemory Translation API (free, no API key required)
 * Falls back to original text if translation fails
 */
async function translateWithLibreTranslate(text: string, from: string, to: string): Promise<string> {
  try {
    // Map language codes to MyMemory format
    const langMap: Record<string, string> = {
      'fr': 'fr',
      'en': 'en',
      'es': 'es',
      'de': 'de',
      'it': 'it',
      'pt': 'pt'
    }
    
    const sourceLang = langMap[from] || from
    const targetLang = langMap[to] || to

    // Use MyMemory Translation API (free, no API key required)
    // Limit to 500 characters per request (MyMemory free limit)
    const textToTranslate = text.length > 500 ? text.substring(0, 500) : text
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${sourceLang}|${targetLang}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.statusText}`)
    }

    const data = await response.json()

    // MyMemory API returns: { responseData: { translatedText: "...", match: ... } }
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText
    }
    
    throw new Error('No translation found in response')
  } catch (error) {
    console.warn('Translation API failed, returning original text:', error)
    // Fallback: Return original text if translation fails
    return text
  }
}

/**
 * Alternative: Google Translate API (requires API key)
 * Uncomment and configure if you have a Google Cloud API key
 */
/*
async function translateWithGoogle(text: string, from: string, to: string): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) {
    throw new Error('Google Translate API key not configured')
  }

  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: from,
      target: to,
      format: 'text'
    })
  })

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data.translations[0].translatedText
}
*/

