'use client'

import { useTwoWayConverter } from './useTwoWayConverter'

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

const REVERSE_ENTITIES: Record<string, string> = Object.fromEntries(
  Object.entries(ENTITIES).map(([k, v]) => [v, k])
)

function encodeHtml(input: string): string {
  return input.replace(/[&<>"'`=/]/g, (char) => ENTITIES[char] || char)
}

function decodeHtml(input: string): string {
  return input.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;|&#x60;|&#x3D;|&#?\w+;/g, (entity) => {
    if (REVERSE_ENTITIES[entity]) return REVERSE_ENTITIES[entity]
    if (entity.startsWith('&#x')) {
      const code = parseInt(entity.slice(3, -1), 16)
      return isNaN(code) ? entity : String.fromCharCode(code)
    }
    if (entity.startsWith('&#')) {
      const code = parseInt(entity.slice(2, -1), 10)
      return isNaN(code) ? entity : String.fromCharCode(code)
    }
    return entity
  })
}

export function HtmlEntitiesTool() {
  const { input, setInput, output, direction, setDirection, error, setError, copied, convert, swap, copyToClipboard, clear } = useTwoWayConverter(
    ['encode', 'decode'],
    (value, mode) => mode === 'encode' ? encodeHtml(value) : decodeHtml(value),
    'Invalid input for this operation',
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => { setDirection('encode'); setError('') }}
          className={`px-4 py-2 rounded text-sm font-medium border-2 transition-all ${
            direction === 'encode'
              ? 'bg-[#e94560] text-white border-[#f39c12]'
              : 'bg-transparent text-[#9ca3af] border-[#2d2d44] hover:text-white'
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => { setDirection('decode'); setError('') }}
          className={`px-4 py-2 rounded text-sm font-medium border-2 transition-all ${
            direction === 'decode'
              ? 'bg-[#e94560] text-white border-[#f39c12]'
              : 'bg-transparent text-[#9ca3af] border-[#2d2d44] hover:text-white'
          }`}
        >
          Decode
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[#9ca3af] mb-2">
            {direction === 'encode' ? 'Plain Text' : 'HTML Entities'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === 'encode' ? 'Enter text to encode as HTML entities...' : 'Enter HTML entities to decode...'}
            className="w-full h-48 p-3 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:border-[#e94560] placeholder:text-[#4a4a5a]"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-[#9ca3af]">
              {direction === 'encode' ? 'Encoded' : 'Decoded'}
            </label>
            {output && (
              <button
                onClick={copyToClipboard}
                className="text-xs text-[#9ca3af] hover:text-[#e94560] transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className="w-full h-48 p-3 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white font-mono text-sm resize-none focus:outline-none placeholder:text-[#4a4a5a]"
          />
        </div>
      </div>

      {error && <p className="text-[#e94560] text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={convert}
          className="flex-1 py-2 px-4 bg-[#e94560] text-white rounded-lg font-medium border-2 border-[#f39c12] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
        >
          {direction === 'encode' ? '→ Encode' : '→ Decode'}
        </button>
        <button
          onClick={swap}
          className="px-4 py-2 bg-[#16213e] text-white rounded-lg font-medium border-2 border-[#2d2d44] hover:border-[#e94560] transition-all"
        >
          ⇄ Swap
        </button>
        <button
          onClick={clear}
          className="px-4 py-2 bg-transparent text-[#9ca3af] rounded-lg font-medium border-2 border-[#2d2d44] hover:text-white hover:border-[#e94560] transition-all"
        >
          Clear
        </button>
      </div>

      <div className="p-3 bg-[#0f0f23] border border-[#2d2d44] rounded-lg">
        <p className="text-xs text-[#9ca3af] mb-2">Common HTML entities:</p>
        <div className="grid grid-cols-2 gap-1 text-xs font-mono text-[#6b7280]">
          <span>&amp; → &amp;amp;</span>
          <span>&lt; → &amp;lt;</span>
          <span>&gt; → &amp;gt;</span>
          <span>&quot; → &amp;quot;</span>
          <span>&#39; → &amp;#39;</span>
          <span>/ → &amp;#x2F;</span>
        </div>
      </div>
    </div>
  )
}
