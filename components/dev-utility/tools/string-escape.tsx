'use client'

import { useTwoWayConverter } from './useTwoWayConverter'

export function StringEscapeTool() {
  const { input, setInput, output, direction, setDirection, error, setError, copied, convert, swap, copyToClipboard, clear } = useTwoWayConverter(
    ['escape', 'unescape'],
    (value, mode) => mode === 'escape' ? JSON.stringify(value).slice(1, -1) : JSON.parse(`"${value}"`),
    'Invalid input — cannot unescape this string',
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => { setDirection('escape'); setError('') }}
          className={`px-4 py-2 rounded text-sm font-medium border-2 transition-all ${
            direction === 'escape'
              ? 'bg-[#e94560] text-white border-[#f39c12]'
              : 'bg-transparent text-[#9ca3af] border-[#2d2d44] hover:text-white'
          }`}
        >
          Escape
        </button>
        <button
          onClick={() => { setDirection('unescape'); setError('') }}
          className={`px-4 py-2 rounded text-sm font-medium border-2 transition-all ${
            direction === 'unescape'
              ? 'bg-[#e94560] text-white border-[#f39c12]'
              : 'bg-transparent text-[#9ca3af] border-[#2d2d44] hover:text-white'
          }`}
        >
          Unescape
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[#9ca3af] mb-2">
            {direction === 'escape' ? 'Raw String' : 'Escaped String'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === 'escape' ? 'Enter raw text with special characters...' : 'Enter escaped string (e.g. \\n \\t \\\\")...'}
            className="w-full h-48 p-3 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:border-[#e94560] placeholder:text-[#4a4a5a]"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-[#9ca3af]">
              {direction === 'escape' ? 'Escaped String' : 'Raw String'}
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
          {direction === 'escape' ? '→ Escape' : '→ Unescape'}
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
        <p className="text-xs text-[#9ca3af] mb-2">What gets escaped:</p>
        <div className="grid grid-cols-2 gap-1 text-xs font-mono text-[#6b7280]">
          <span>\&quot; → quote</span>
          <span>\\ → backslash</span>
          <span>\\n → newline</span>
          <span>\\t → tab</span>
          <span>\\r → carriage return</span>
          <span>\\uXXXX → unicode</span>
        </div>
      </div>
    </div>
  )
}
