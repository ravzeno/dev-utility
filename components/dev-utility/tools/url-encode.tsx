'use client'

import { useState } from 'react'
import { useTwoWayConverter } from './useTwoWayConverter'

export function UrlEncodeTool() {
  const [mode, setMode] = useState<'component' | 'uri'>('component')
  const { input, setInput, output, direction, setDirection, error, setError, copied, convert, swap, copyToClipboard, clear } = useTwoWayConverter(
    ['encode', 'decode'],
    (value, direction) => direction === 'encode'
      ? (mode === 'component' ? encodeURIComponent(value) : encodeURI(value))
      : (mode === 'component' ? decodeURIComponent(value) : decodeURI(value)),
    'Invalid input for this operation',
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[#2a3958] pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#8192b5]">การทำงาน</p>
          <div className="inline-flex gap-1 rounded-lg border border-[#31425f] bg-[#0d1526] p-1">
        <button
          onClick={() => { setDirection('encode'); setError('') }}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            direction === 'encode'
              ? 'bg-[#7283ff] text-white shadow-sm'
              : 'text-[#91a0be] hover:text-white'
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => { setDirection('decode'); setError('') }}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            direction === 'decode'
              ? 'bg-[#7283ff] text-white shadow-sm'
              : 'text-[#91a0be] hover:text-white'
          }`}
        >
          Decode
        </button>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#8192b5]">รูปแบบการเข้ารหัส</p>
          <div className="flex items-center gap-1 text-xs text-[#9ca3af]">
          <button
            onClick={() => setMode('component')}
            className={`rounded-md border px-2.5 py-1.5 transition-colors ${
              mode === 'component'
                ? 'border-[#536ab0] bg-[#1a2846] text-white'
                : 'border-[#2d3b58] text-[#91a0be] hover:border-[#52658e] hover:text-white'
            }`}
          >
            encodeURIComponent
          </button>
          <button
            onClick={() => setMode('uri')}
            className={`rounded-md border px-2.5 py-1.5 transition-colors ${
              mode === 'uri'
                ? 'border-[#536ab0] bg-[#1a2846] text-white'
                : 'border-[#2d3b58] text-[#91a0be] hover:border-[#52658e] hover:text-white'
            }`}
          >
            encodeURI
          </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#c2cde4]">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === 'encode' ? 'Enter URL to encode...' : 'Enter encoded URL to decode...'}
            style={{ height: '13rem' }}
            className="w-full resize-none rounded-xl border border-[#2b3b5c] bg-[#0d1526] p-3.5 font-mono text-sm leading-6 text-[#edf2ff] outline-none transition-colors placeholder:text-[#596985] focus:border-[#8092ff]"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[#c2cde4]">Output</label>
            {output && (
              <button
                onClick={copyToClipboard}
                className="text-xs font-medium text-[#9caccc] transition-colors hover:text-[#b9c5ff]"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            style={{ height: '13rem' }}
            className="w-full resize-none rounded-xl border border-[#2b3b5c] bg-[#0d1526] p-3.5 font-mono text-sm leading-6 text-[#edf2ff] outline-none placeholder:text-[#596985]"
          />
        </div>
      </div>

      {error && <p className="rounded-lg border border-[#7b4558] bg-[#2a1822] px-3 py-2 text-sm text-[#ff9aac]">{error}</p>}

      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={convert}
          className="min-w-40 flex-1 rounded-lg bg-[#7283ff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#263a8b]/40 transition-colors hover:bg-[#8492ff]"
        >
          {direction === 'encode' ? '→ Encode' : '→ Decode'}
        </button>
        <button
          onClick={swap}
          className="rounded-lg border border-[#354662] bg-[#17233a] px-4 py-2.5 text-sm font-medium text-[#e7edff] transition-colors hover:border-[#6075ab] hover:bg-[#1b2944]"
        >
          ⇄ Swap
        </button>
        <button
          onClick={clear}
          className="rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-[#91a0be] transition-colors hover:bg-[#17233a] hover:text-white"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
