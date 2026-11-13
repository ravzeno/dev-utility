'use client'

import { useMemo, useState } from 'react'

type DiffLine = { type: 'same' | 'removed' | 'added'; text: string }
const MAX_CELLS = 1_000_000

function compareLines(before: string, after: string): DiffLine[] | null {
  const left = before ? before.split('\n') : []
  const right = after ? after.split('\n') : []
  if ((left.length + 1) * (right.length + 1) > MAX_CELLS) return null

  const width = right.length + 1
  const lengths = new Uint32Array((left.length + 1) * width)
  for (let i = left.length - 1; i >= 0; i--) {
    for (let j = right.length - 1; j >= 0; j--) {
      lengths[i * width + j] = left[i] === right[j]
        ? lengths[(i + 1) * width + j + 1] + 1
        : Math.max(lengths[(i + 1) * width + j], lengths[i * width + j + 1])
    }
  }

  const result: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) {
      result.push({ type: 'same', text: left[i++] })
      j++
    } else if (i < left.length && (j === right.length || lengths[(i + 1) * width + j] >= lengths[i * width + j + 1])) {
      result.push({ type: 'removed', text: left[i++] })
    } else {
      result.push({ type: 'added', text: right[j++] })
    }
  }
  return result
}

export function TextDiffTool() {
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')
  const lines = useMemo(() => compareLines(before, after), [before, after])

  return <div className="space-y-5">
    <div className="grid gap-4 md:grid-cols-2">
      {[
        { label: 'Original', value: before, set: setBefore },
        { label: 'Modified', value: after, set: setAfter },
      ].map((field) => <label key={field.label} className="space-y-2 text-sm text-[#9ca3af]">
        <span className="block">{field.label}</span>
        <textarea value={field.value} onChange={(event) => field.set(event.target.value)} spellCheck={false} placeholder={`Paste ${field.label.toLowerCase()} text`} className="min-h-48 w-full resize-y rounded-lg border border-[#2d2d44] bg-[#1a1a2e] p-3 font-mono text-sm leading-6 text-white focus:border-[#e94560] focus:outline-none" />
      </label>)}
    </div>
    <div className="flex items-center justify-between gap-4">
      <h3 className="text-sm font-semibold text-white">Line comparison</h3>
      <button type="button" onClick={() => { setBefore(''); setAfter('') }} disabled={!before && !after} className="rounded border border-[#2d2d44] px-3 py-1.5 text-xs text-[#9ca3af] hover:border-[#e94560] hover:text-white disabled:opacity-40">Clear</button>
    </div>
    {lines === null ? <p role="alert" className="text-sm text-[#e94560]">Text is too large to compare here. Reduce the number of lines and try again.</p>
      : lines.length === 0 ? <p className="text-sm text-[#9ca3af]">Paste text above to compare changes line by line.</p>
      : <pre className="max-h-[32rem] overflow-auto rounded-lg border border-[#2d2d44] bg-[#0f0f23] py-2 font-mono text-sm leading-6" aria-label="Comparison result">{lines.map((line, index) => <span key={index} className={`block whitespace-pre-wrap break-all px-3 ${line.type === 'added' ? 'bg-emerald-900/30 text-emerald-200' : line.type === 'removed' ? 'bg-rose-900/30 text-rose-200' : 'text-[#9ca3af]'}`}><span aria-hidden="true" className="mr-3 inline-block w-3 select-none">{line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}</span>{line.text || ' '}{'\n'}</span>)}</pre>}
    <p className="text-xs text-[#9ca3af]">+ added &nbsp;&nbsp; − removed &nbsp;&nbsp; unchanged lines appear without a marker.</p>
  </div>
}
