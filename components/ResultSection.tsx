'use client'

import { useState } from 'react'

const TABS = [
  { id: 'overview', label: '📊 概要' },
  { id: 'seo', label: '📝 SEO基本' },
  { id: 'ogp', label: '📣 OGP/SNS' },
  { id: 'technical', label: '⚙️ テクニカル' },
  { id: 'structured', label: '🏗 構造化' },
  { id: 'llmo', label: '🤖 LLMO/AI' },
]

function Badge({ ok, label }: { ok: boolean; label?: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      padding: '2px 8px',
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 700,
      background: ok ? '#ECFDF5' : '#FEF2F2',
      color: ok ? '#059669' : '#DC2626',
      border: `1px solid ${ok ? '#A7F3D0' : '#FECACA'}`,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {ok ? '✓' : '✗'} {label ?? (ok ? 'OK' : 'NG')}
    </span>
  )
}

function Row({ label, value, status, note }: { label: string; value?: string; status?: boolean; note?: string }) {
  return (
    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--bws-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--bws-muted)', marginBottom: 2 }}>{label}</div>
          {value && (
            <div style={{ fontSize: 13, color: 'var(--bws-text)', wordBreak: 'break-all', lineHeight: 1.5 }}>
              {value}
            </div>
          )}
          {!value && status === false && (
            <div style={{ fontSize: 13, color: 'var(--bws-muted-light)' }}>未設定</div>
          )}
          {note && (
            <div style={{ fontSize: 11, color: 'var(--bws-muted)', marginTop: 3 }}>{note}</div>
          )}
        </div>
        {status !== undefined && <Badge ok={status} />}
      </div>
    </div>
  )
}

function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className={`fade-in-up fade-in-up-${delay + 1}`} style={{
      background: '#fff',
      border: '1px solid var(--bws-border)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 14,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {children}
    </div>
  )
}

function CardHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: '1px solid var(--bws-border)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: '#FAFAFA',
    }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--bws-text)' }}>{title}</span>
    </div>
  )
}

function ScoreCircle({ score }: { score: number }) {
  const r = 45
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#059669' : score >= 60 ? '#D97706' : '#DC2626'

  return (
    <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
      <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="#F3F4F6" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: 'var(--bws-muted)', marginTop: 1 }}>/ 100</span>
      </div>
    </div>
  )
}

export default function ResultSection({ result }: { result: any }) {
  const [activeTab, setActiveTab] = useState('overview')
  const { seo, ogp, technical, structured, llmo } = result

  const countOk = (checks: boolean[]) => checks.filter(Boolean).length
  const seoChecks = [seo.title.exists, seo.description.exists, seo.h1s.length === 1, seo.imgAltMissing === 0]
  const ogpChecks = [ogp.ogTitle.exists, ogp.ogDescription.exists, ogp.ogImage.exists, ogp.twitterCard.exists]
  const techChecks = [technical.canonical.exists, technical.viewport.exists, technical.charset.exists, technical.lang.exists]
  const structChecks = [structured.jsonLd.length > 0]

  const scores = {
    seo: Math.round(countOk(seoChecks) / seoChecks.length * 100),
    ogp: Math.round(countOk(ogpChecks) / ogpChecks.length * 100),
    technical: Math.round(countOk(techChecks) / techChecks.length * 100),
    structured: structured.jsonLd.length > 0 ? 100 : 0,
  }

  const scoreColor = (s: number) => s >= 80 ? '#059669' : s >= 60 ? '#D97706' : '#DC2626'
  const scoreBg = (s: number) => s >= 80 ? '#ECFDF5' : s >= 60 ? '#FFFBEB' : '#FEF2F2'

  return (
    <div>
      {/* 診断URL */}
      <div className="fade-in-up fade-in-up-1" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px',
        background: '#fff',
        border: '1px solid var(--bws-border)',
        borderRadius: 10,
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        fontSize: 13,
      }}>
        <span style={{ color: 'var(--bws-muted)', flexShrink: 0 }}>診断URL</span>
        <span style={{ color: 'var(--bws-blue)', wordBreak: 'break-all' }}>{result.url}</span>
      </div>

      {/* Tabs */}
      <div className="result-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >{tab.label}</button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div>
          {/* AI評価 */}
          {llmo && (
            <Card delay={0}>
              <CardHeader icon="🤖" title="AI総合評価（Claude）" />
              <div style={{
                padding: 20,
                display: 'flex',
                gap: 20,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}>
                <ScoreCircle score={llmo.score} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--bws-text)', marginBottom: 12 }}>
                    {llmo.summary}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {llmo.good?.map((g: string, i: number) => (
                      <span key={i} style={{
                        fontSize: 12, padding: '3px 10px', borderRadius: 6,
                        background: '#ECFDF5', color: '#059669',
                        border: '1px solid #A7F3D0',
                      }}>✓ {g}</span>
                    ))}
                    {llmo.improve?.map((g: string, i: number) => (
                      <span key={i} style={{
                        fontSize: 12, padding: '3px 10px', borderRadius: 6,
                        background: '#FFFBEB', color: '#D97706',
                        border: '1px solid #FDE68A',
                      }}>⚡ {g}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* スコアグリッド */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            marginBottom: 14,
          }}>
            {[
              { label: 'SEO基本', score: scores.seo, ok: countOk(seoChecks), total: seoChecks.length },
              { label: 'OGP/SNS', score: scores.ogp, ok: countOk(ogpChecks), total: ogpChecks.length },
              { label: 'テクニカル', score: scores.technical, ok: countOk(techChecks), total: techChecks.length },
              { label: '構造化データ', score: scores.structured, ok: countOk(structChecks), total: structChecks.length },
            ].map((item, i) => (
              <div key={i} className={`fade-in-up fade-in-up-${i + 2}`} style={{
                background: '#fff',
                border: '1px solid var(--bws-border)',
                borderRadius: 12,
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--bws-muted)', marginBottom: 6 }}>{item.label}</div>
                <div style={{
                  fontSize: 30, fontWeight: 700,
                  color: scoreColor(item.score),
                  lineHeight: 1,
                }}>{item.score}<span style={{ fontSize: 13, fontWeight: 400 }}>%</span></div>
                <div style={{ fontSize: 11, color: 'var(--bws-muted)', marginTop: 4 }}>
                  {item.ok}/{item.total} 項目クリア
                </div>
                <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, marginTop: 8 }}>
                  <div style={{
                    height: '100%',
                    width: `${item.score}%`,
                    background: scoreColor(item.score),
                    borderRadius: 2,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* 主要チェック */}
          <Card delay={4}>
            <CardHeader icon="📋" title="主要チェック項目" />
            <div>
              {[
                { label: 'titleタグ', ok: seo.title.exists, value: seo.title.value },
                { label: 'meta description', ok: seo.description.exists, value: seo.description.value },
                { label: 'H1タグ (1個)', ok: seo.h1s.length === 1, value: seo.h1s.join(', ') || '未設定' },
                { label: 'OGP画像', ok: ogp.ogImage.exists, value: ogp.ogImage.value },
                { label: 'Canonical', ok: technical.canonical.exists, value: technical.canonical.value },
                { label: 'viewport', ok: technical.viewport.exists, value: technical.viewport.value },
                { label: '構造化データ', ok: structured.jsonLd.length > 0, value: structured.jsonLd.map((j: any) => j.type).join(', ') || '未設定' },
                { label: 'alt属性欠損', ok: seo.imgAltMissing === 0, value: seo.imgAltMissing > 0 ? `${seo.imgAltMissing}件の未設定` : 'すべて設定済み' },
              ].map((item, i) => (
                <Row key={i} label={item.label} value={item.value} status={item.ok} />
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div>
          <Card delay={0}>
            <CardHeader icon="📝" title="SEO基本" />
            <div>
              <Row label="titleタグ" value={seo.title.value || '未設定'} status={seo.title.exists}
                note={seo.title.exists ? `文字数: ${seo.titleLength}文字 ${seo.titleLength > 60 ? '⚠️ 60文字超過' : seo.titleLength < 20 ? '⚠️ 短すぎる可能性' : '✓ 適切'}` : undefined} />
              <Row label="meta description" value={seo.description.value || '未設定'} status={seo.description.exists}
                note={seo.description.exists ? `文字数: ${seo.descLength}文字 ${seo.descLength > 160 ? '⚠️ 160文字超過' : seo.descLength < 50 ? '⚠️ 短すぎる可能性' : '✓ 適切'}` : undefined} />
              <Row label="meta keywords" value={seo.keywords.value || '未設定（現代SEOでは不要）'} status={true} />
              <Row label="H1タグ" value={seo.h1s.join(' / ') || '未設定'} status={seo.h1s.length === 1}
                note={seo.h1s.length > 1 ? `⚠️ H1が${seo.h1s.length}個（1個推奨）` : seo.h1s.length === 0 ? '⚠️ H1タグがありません' : undefined} />
            </div>
          </Card>
          <Card delay={1}>
            <CardHeader icon="🔤" title="見出し構造 (H2 上位5件)" />
            <div>
              {seo.h2s.length > 0
                ? seo.h2s.map((h: string, i: number) => <Row key={i} label={`H2 ${i + 1}`} value={h} status={true} />)
                : <div style={{ padding: '16px', color: 'var(--bws-muted)', fontSize: 13 }}>H2タグが見つかりませんでした</div>
              }
            </div>
          </Card>
          <Card delay={2}>
            <CardHeader icon="🖼️" title="画像 alt属性" />
            <div>
              <Row label="総画像数" value={`${seo.imgTotal}枚`} status={true} />
              <Row label="alt属性未設定" value={`${seo.imgAltMissing}枚`} status={seo.imgAltMissing === 0}
                note={seo.imgAltMissing > 0 ? '⚠️ 全画像にalt属性の設定を推奨します' : undefined} />
            </div>
          </Card>
        </div>
      )}

      {/* OGP Tab */}
      {activeTab === 'ogp' && (
        <div>
          <Card delay={0}>
            <CardHeader icon="📣" title="Open Graph Protocol (OGP)" />
            <div>
              <Row label="og:title" value={ogp.ogTitle.value} status={ogp.ogTitle.exists} />
              <Row label="og:description" value={ogp.ogDescription.value} status={ogp.ogDescription.exists} />
              <Row label="og:image" value={ogp.ogImage.value} status={ogp.ogImage.exists} />
              <Row label="og:type" value={ogp.ogType.value} status={ogp.ogType.exists} />
              <Row label="og:url" value={ogp.ogUrl.value} status={ogp.ogUrl.exists} />
            </div>
          </Card>
          <Card delay={1}>
            <CardHeader icon="🐦" title="Twitter / X Card" />
            <div>
              <Row label="twitter:card" value={ogp.twitterCard.value} status={ogp.twitterCard.exists} />
              <Row label="twitter:title" value={ogp.twitterTitle.value} status={ogp.twitterTitle.exists} />
              <Row label="twitter:image" value={ogp.twitterImage.value} status={ogp.twitterImage.exists} />
            </div>
          </Card>
          {ogp.ogImage.exists && (
            <Card delay={2}>
              <CardHeader icon="🖼️" title="OGP画像プレビュー" />
              <div style={{ padding: 16 }}>
                <div style={{
                  borderRadius: 8, overflow: 'hidden',
                  border: '1px solid var(--bws-border)',
                  maxWidth: 400,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  <img src={ogp.ogImage.value} alt="OGP" style={{ width: '100%', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <div style={{ padding: '10px 14px', background: '#F9FAFB' }}>
                    <div style={{ fontSize: 11, color: 'var(--bws-muted)', marginBottom: 3 }}>
                      {new URL(result.url.startsWith('http') ? result.url : 'https://' + result.url).hostname}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--bws-text)' }}>{ogp.ogTitle.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--bws-muted)', marginTop: 2 }}>{ogp.ogDescription.value}</div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Technical Tab */}
      {activeTab === 'technical' && (
        <Card delay={0}>
          <CardHeader icon="⚙️" title="テクニカルSEO" />
          <div>
            <Row label="Canonical URL" value={technical.canonical.value} status={technical.canonical.exists}
              note={!technical.canonical.exists ? '⚠️ 重複コンテンツ対策のため設定推奨' : undefined} />
            <Row label="robots meta" value={technical.robotsMeta.value || '未設定（デフォルトでindex/follow）'} status={true} />
            <Row label="viewport" value={technical.viewport.value} status={technical.viewport.exists}
              note={!technical.viewport.exists ? '⚠️ モバイル対応に必須です' : undefined} />
            <Row label="charset" value={technical.charset.value} status={technical.charset.exists} />
            <Row label="lang属性" value={technical.lang.value} status={technical.lang.exists}
              note={!technical.lang.exists ? '⚠️ html要素にlang属性を設定してください' : undefined} />
            <Row label="hreflang" value={technical.hreflang ? '設定あり' : '未設定'} status={true}
              note="多言語サイトの場合は設定推奨" />
          </div>
        </Card>
      )}

      {/* Structured Tab */}
      {activeTab === 'structured' && (
        <Card delay={0}>
          <CardHeader icon="🏗" title="構造化データ (JSON-LD)" />
          <div>
            {structured.jsonLd.length === 0 ? (
              <div style={{ padding: 20 }}>
                <div style={{ color: '#DC2626', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                  ✗ 構造化データが見つかりませんでした
                </div>
                <p style={{ color: 'var(--bws-muted)', fontSize: 13, lineHeight: 1.7 }}>
                  構造化データを設定することで、Googleのリッチリザルト（星評価・パンくずリスト等）が表示される可能性があります。
                  AI検索（LLMO）での引用率向上にも効果的です。
                </p>
              </div>
            ) : (
              structured.jsonLd.map((item: any, i: number) => (
                <div key={i} style={{ borderBottom: '1px solid var(--bws-border)' }}>
                  <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge ok={true} label={item.type} />
                    <span style={{ fontSize: 12, color: 'var(--bws-muted)' }}>JSON-LD #{i + 1}</span>
                  </div>
                  <pre style={{
                    padding: '0 16px 12px', fontSize: 11,
                    color: 'var(--bws-muted)', overflowX: 'auto', fontFamily: 'monospace',
                  }}>{item.raw}...</pre>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* LLMO Tab */}
      {activeTab === 'llmo' && (
        <div>
          {llmo ? (
            <>
              <Card delay={0}>
                <CardHeader icon="🤖" title="AI総合スコア（Claude評価）" />
                <div style={{ padding: 20, display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <ScoreCircle score={llmo.score} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--bws-text)' }}>{llmo.summary}</p>
                  </div>
                </div>
              </Card>
              <Card delay={1}>
                <CardHeader icon="✅" title="良い点" />
                <div>
                  {llmo.good?.map((g: string, i: number) => (
                    <div key={i} style={{
                      padding: '11px 16px', borderBottom: '1px solid var(--bws-border)',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                      <span style={{ color: '#059669', flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, lineHeight: 1.6 }}>{g}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card delay={2}>
                <CardHeader icon="⚡" title="改善推奨事項" />
                <div>
                  {llmo.improve?.map((g: string, i: number) => (
                    <div key={i} style={{
                      padding: '11px 16px', borderBottom: '1px solid var(--bws-border)',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                      <span style={{ color: '#D97706', flexShrink: 0 }}>⚡</span>
                      <span style={{ fontSize: 13, lineHeight: 1.6 }}>{g}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div style={{ padding: 24, color: 'var(--bws-muted)', textAlign: 'center', fontSize: 14 }}>
                AI評価データがありません
              </div>
            </Card>
          )}
          <Card delay={3}>
            <CardHeader icon="📖" title="LLMOとは？" />
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--bws-muted)' }}>
                <strong style={{ color: 'var(--bws-text)' }}>LLMO（Large Language Model Optimization）</strong>とは、
                ChatGPT・Claude・Gemini等のAI検索に自社サイトの情報が引用・参照されるよう最適化する手法です。
                構造化データ・明確なタイトル・信頼性の高いコンテンツがLLMO対策の基本です。
              </p>
              <div style={{
                marginTop: 12, padding: '10px 14px',
                background: '#EFF6FF', border: '1px solid #BFDBFE',
                borderRadius: 8, fontSize: 13, color: '#1D4ED8',
              }}>
                💡 AI検索時代に対応するため、SEOと並行してLLMO対策も重要になっています。
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
