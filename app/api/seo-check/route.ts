import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url) {
    return NextResponse.json({ error: 'URLが必要です' }, { status: 400 })
  }

  let targetUrl = url
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl
  }

  let html = ''
  let fetchError = null

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BWS-SEOChecker/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    })
    html = await res.text()
  } catch (e: any) {
    fetchError = e.message
  }

  if (fetchError || !html) {
    return NextResponse.json({ error: `取得失敗: ${fetchError}` }, { status: 502 })
  }

  const result = analyzeHtml(html, targetUrl)

  // LLMO: Claude API で AI 評価
  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `以下のSEO診断データをもとに、日本語で簡潔なAI評価コメントを生成してください。
良い点1〜2つ、改善点2〜3つ、総合スコア(0-100)をJSONで返してください。
形式: {"score": 75, "good": ["...","..."], "improve": ["...","...","..."], "summary": "..."}
JSON以外は出力しないこと。

データ: ${JSON.stringify({
  title: result.seo.title,
  description: result.seo.description,
  h1Count: result.seo.h1s.length,
  hasCanonical: result.technical.canonical.exists,
  ogImage: result.ogp.ogImage.exists,
  hasJsonLd: result.structured.jsonLd.length > 0,
  imgAltMissing: result.seo.imgAltMissing,
  titleLength: result.seo.titleLength,
  descLength: result.seo.descLength,
})}`
        }]
      })
    })
    const aiData = await aiRes.json()
    const aiText = aiData.content?.[0]?.text || ''
    try {
      result.llmo = JSON.parse(aiText.replace(/```json|```/g, '').trim())
    } catch {
      result.llmo = { score: 0, good: [], improve: [], summary: 'AI評価を取得できませんでした' }
    }
  } catch {
    result.llmo = { score: 0, good: [], improve: [], summary: 'AI評価を取得できませんでした' }
  }

  return NextResponse.json(result)
}

function analyzeHtml(html: string, url: string) {
  const getTag = (tag: string) => {
    const m = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
    return m ? m[1].replace(/<[^>]+>/g, '').trim() : ''
  }
  const getMeta = (name: string) => {
    const patterns = [
      new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'),
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m) return m[1]
    }
    return ''
  }
  const getOg = (prop: string) => {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'),
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m) return m[1]
    }
    return ''
  }
  const getTwitter = (name: string) => {
    const patterns = [
      new RegExp(`<meta[^>]+name=["']twitter:${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:${name}["']`, 'i'),
    ]
    for (const p of patterns) { const m = html.match(p); if (m) return m[1] }
    return ''
  }

  // SEO基本
  const title = getTag('title')
  const description = getMeta('description')
  const keywords = getMeta('keywords')
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || []
  const h1s = h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim())
  const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || []
  const h2s = h2Matches.map(h => h.replace(/<[^>]+>/g, '').trim()).slice(0, 5)

  const imgTags = html.match(/<img[^>]+>/gi) || []
  const imgAltMissing = imgTags.filter(img => !img.match(/alt=["'][^"']+["']/i)).length

  // OGP
  const ogTitle = getOg('title')
  const ogDescription = getOg('description')
  const ogImage = getOg('image')
  const ogType = getOg('type')
  const ogUrl = getOg('url')
  const twitterCard = getTwitter('card')
  const twitterTitle = getTwitter('title')
  const twitterImage = getTwitter('image')

  // テクニカルSEO
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)
  const canonical = canonicalMatch ? canonicalMatch[1] : ''
  const robotsMeta = getMeta('robots')
  const viewportMeta = getMeta('viewport')
  const charsetMatch = html.match(/<meta[^>]+charset=["']?([^"'\s>]+)/i)
  const charset = charsetMatch ? charsetMatch[1] : ''
  const langMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i)
  const lang = langMatch ? langMatch[1] : ''
  const hasHreflang = /<link[^>]+hreflang/i.test(html)

  // 構造化データ
  const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || []
  const jsonLd = jsonLdMatches.map(s => {
    try {
      const content = s.replace(/<script[^>]*>|<\/script>/gi, '')
      const parsed = JSON.parse(content)
      return { type: parsed['@type'] || 'Unknown', raw: content.slice(0, 200) }
    } catch { return { type: 'Parse Error', raw: '' } }
  })

  return {
    url,
    seo: {
      title: { value: title, exists: !!title },
      titleLength: title.length,
      description: { value: description, exists: !!description },
      descLength: description.length,
      keywords: { value: keywords, exists: !!keywords },
      h1s,
      h2s,
      imgTotal: imgTags.length,
      imgAltMissing,
    },
    ogp: {
      ogTitle: { value: ogTitle, exists: !!ogTitle },
      ogDescription: { value: ogDescription, exists: !!ogDescription },
      ogImage: { value: ogImage, exists: !!ogImage },
      ogType: { value: ogType, exists: !!ogType },
      ogUrl: { value: ogUrl, exists: !!ogUrl },
      twitterCard: { value: twitterCard, exists: !!twitterCard },
      twitterTitle: { value: twitterTitle, exists: !!twitterTitle },
      twitterImage: { value: twitterImage, exists: !!twitterImage },
    },
    technical: {
      canonical: { value: canonical, exists: !!canonical },
      robotsMeta: { value: robotsMeta, exists: !!robotsMeta },
      viewport: { value: viewportMeta, exists: !!viewportMeta },
      charset: { value: charset, exists: !!charset },
      lang: { value: lang, exists: !!lang },
      hreflang: hasHreflang,
    },
    structured: {
      jsonLd,
    },
    llmo: null as any,
  }
}
