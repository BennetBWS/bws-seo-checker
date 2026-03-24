'use client'

import { useState, useRef } from 'react'
import ResultSection from './ResultSection'

export default function SeoChecker() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCheck = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/seo-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '診断に失敗しました')
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCheck()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bws-bg)' }}>
      <style>{`
        .input-wrap { display: flex; flex-direction: column; gap: 8px; }
        .input-inner {
          display: flex;
          background: #fff;
          border: 1px solid var(--bws-border-dark);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .input-inner:focus-within {
          border-color: var(--bws-blue);
          box-shadow: 0 0 0 3px rgba(26,115,232,0.12);
        }
        .btn-check {
          background: var(--bws-blue);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px 20px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: 'Noto Sans JP', sans-serif;
          transition: background 0.2s;
          white-space: nowrap;
          width: 100%;
          box-shadow: 0 2px 6px rgba(26,115,232,0.3);
        }
        .btn-check:hover:not(:disabled) { background: var(--bws-blue-dark); }
        .btn-check:disabled { background: #93B4F0; cursor: not-allowed; box-shadow: none; }
        .result-tabs {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 2px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          margin-bottom: 16px;
        }
        .result-tabs::-webkit-scrollbar { display: none; }
        .tab-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid var(--bws-border);
          background: #fff;
          color: var(--bws-muted);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          font-family: 'Noto Sans JP', sans-serif;
        }
        .tab-btn:hover { border-color: var(--bws-blue); color: var(--bws-blue); }
        .tab-btn.active {
          border-color: var(--bws-blue);
          background: var(--bws-blue-light);
          color: var(--bws-blue);
        }
        @media (min-width: 600px) {
          .input-wrap { flex-direction: row; gap: 0; }
          .input-inner { flex: 1; border-radius: 10px 0 0 10px; }
          .btn-check { width: auto; border-radius: 0 10px 10px 0; padding: 0 28px; font-size: 15px; }
        }
      `}</style>

      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid var(--bws-border)',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/logo.png"
            alt="Bennet BWS"
            style={{ height: 28, objectFit: 'contain', filter: 'brightness(0)' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span style={{
            width: 1,
            height: 20,
            background: '#D1D5DB',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 14, color: '#1F2937', fontWeight: 500 }}>
            SEO診断ツール
          </span>
        </div>
      </header>

      {/* サマリーバー */}
      <div style={{
        background: 'linear-gradient(135deg, #111827 0%, #2D3748 100%)',
        color: '#fff',
        padding: '20px 24px',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
            URLを入力してSEOを診断
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
            SEO総合チェッカー
          </div>

          <div className="input-wrap">
            <div className="input-inner">
              <span style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 14,
                color: 'var(--bws-muted)',
                flexShrink: 0,
                fontSize: 13,
              }}>https://</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="url"
                value={url.replace(/^https?:\/\//, '')}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="example.com"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--bws-text)',
                  fontSize: 15,
                  padding: '13px 10px',
                  fontFamily: 'Noto Sans JP, sans-serif',
                  minWidth: 0,
                }}
              />
            </div>
            <button className="btn-check" onClick={handleCheck} disabled={loading || !url.trim()}>
              {loading
                ? <><span className="spinner" style={{ width: 15, height: 15 }} /> 診断中…</>
                : '診断する →'}
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: 10,
              color: '#FCA5A5',
              fontSize: 13,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              padding: '10px 14px',
            }}>⚠️ {error}</div>
          )}

          <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
            ※ 診断結果はあくまで参考情報です。実際のSEO効果は様々な要因により異なります。
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 80px' }}>
        {loading && (
          <div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: 100, marginBottom: 12 }} />
            ))}
          </div>
        )}
        {result && !loading && <ResultSection result={result} />}
        {!result && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--bws-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--bws-text)' }}>
              URLを入力して診断開始
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              SEO基本・OGP・テクニカルSEO・構造化データ・LLMO（AI最適化）を<br />
              まとめて無料でチェックできます
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--bws-border)',
        padding: '20px 16px',
        textAlign: 'center',
        color: 'var(--bws-muted)',
        fontSize: 12,
        background: '#fff',
      }}>
        © 2025 株式会社Bennet BWS
      </footer>
    </div>
  )
}