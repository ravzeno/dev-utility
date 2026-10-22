'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_CODE = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`

let mermaidInitialized = false

async function getMermaid() {
  const mermaid = (await import('mermaid')).default
  if (!mermaidInitialized) {
    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' })
    mermaidInitialized = true
  }
  return mermaid
}

export function MermaidTool() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const renderTokenRef = useRef(0)

  useEffect(() => {
    const token = ++renderTokenRef.current
    const trimmed = code.trim()
    if (!trimmed) {
      return
    }
    const handle = setTimeout(async () => {
      try {
        const mermaid = await getMermaid()
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
        const { svg: rendered } = await mermaid.render(id, code)
        if (token !== renderTokenRef.current) return
        setSvg(rendered)
        setError(null)
      } catch (err) {
        if (token !== renderTokenRef.current) return
        setError(err instanceof Error ? err.message : String(err))
        setSvg('')
      }
    }, 300)
    return () => clearTimeout(handle)
  }, [code])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [code])

  const handleClear = useCallback(() => { setCode(''); setSvg(''); setError(null) }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={!code}
            className="px-3 py-1.5 text-xs text-[#9ca3af] hover:text-[#e94560] border border-[#2d2d44] rounded transition-all disabled:opacity-40"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleClear}
            disabled={!code}
            className="px-3 py-1.5 text-xs text-[#9ca3af] hover:text-[#e94560] border border-[#2d2d44] rounded transition-all disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ minHeight: 480 }}>
        {/* Editor */}
        <div className="flex flex-col overflow-hidden rounded-lg border-2 border-[#2d2d44]">
          <div className="flex items-center justify-between border-b border-[#2d2d44] px-3 py-2">
            <span className="text-sm font-medium text-white">Editor</span>
            <span className="text-xs text-[#9ca3af]">{code.length} chars</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 min-h-0 p-3 bg-[#1a1a2e] text-white font-mono text-sm resize-none focus:outline-none"
            style={{ minHeight: 400 }}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col overflow-hidden rounded-lg border-2 border-[#2d2d44]">
          <div className="flex items-center justify-between border-b border-[#2d2d44] px-3 py-2">
            <span className="text-sm font-medium text-white">Preview</span>
          </div>
          <div className="flex-1 min-h-0 bg-[#0f0f23] p-4 overflow-auto flex items-center justify-center" style={{ minHeight: 400 }}>
            {!code.trim() ? (
              <p className="text-sm text-[#9ca3af]">Type Mermaid syntax to see a preview.</p>
            ) : error ? (
              <pre className="max-h-full max-w-full overflow-auto p-3 text-xs text-[#e94560] bg-[#1a1a2e] rounded border border-[#e94560]/30">
                {error}
              </pre>
            ) : svg ? (
              <div
                className="[&>svg]:max-w-none [&>svg]:h-auto [&>svg]:w-auto"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <p className="text-sm text-[#9ca3af]">Type Mermaid syntax to see a preview.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
