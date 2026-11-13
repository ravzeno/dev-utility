'use client'

import { useState } from 'react'

const BASES = [
  { value: 2, label: 'Binary' },
  { value: 8, label: 'Octal' },
  { value: 10, label: 'Decimal' },
  { value: 16, label: 'Hexadecimal' },
] as const

function parseInteger(input: string, base: number): bigint | null {
  const value = input.trim().replace(/_/g, '')
  if (!value) return null
  const negative = value.startsWith('-')
  const digits = negative || value.startsWith('+') ? value.slice(1) : value
  const pattern = base === 2 ? /^[01]+$/i : base === 8 ? /^[0-7]+$/i : base === 10 ? /^\d+$/ : /^[\da-f]+$/i
  if (!pattern.test(digits)) return null
  const prefix = base === 2 ? '0b' : base === 8 ? '0o' : base === 16 ? '0x' : ''
  const number = BigInt(prefix + digits)
  return negative ? -number : number
}

export function NumberBaseTool() {
  const [input, setInput] = useState('255')
  const [base, setBase] = useState<number>(10)
  const [copied, setCopied] = useState<number | null>(null)
  const number = parseInteger(input, base)

  async function copy(value: string, targetBase: number) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(targetBase)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
        <label className="space-y-2 text-sm text-[#9ca3af]">
          <span className="block">Number</span>
          <input value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} placeholder="Enter an integer" className="w-full rounded-lg border border-[#2d2d44] bg-[#1a1a2e] p-3 font-mono text-white focus:border-[#e94560] focus:outline-none" />
        </label>
        <label className="space-y-2 text-sm text-[#9ca3af]">
          <span className="block">Input base</span>
          <select value={base} onChange={(event) => setBase(Number(event.target.value))} className="w-full rounded-lg border border-[#2d2d44] bg-[#1a1a2e] p-3 text-white focus:border-[#e94560] focus:outline-none">
            {BASES.map((item) => <option value={item.value} key={item.value}>{item.label} ({item.value})</option>)}
          </select>
        </label>
      </div>
      {input.trim() && number === null && <p role="alert" className="text-sm text-[#e94560]">Enter a valid integer for the selected base. Prefixes such as 0x are not needed.</p>}
      <div className="divide-y divide-[#2d2d44] rounded-lg border border-[#2d2d44]">
        {BASES.map((item) => {
          const value = number === null ? '' : number.toString(item.value).toUpperCase()
          return <div key={item.value} className="flex flex-wrap items-center gap-3 p-4">
            <span className="w-32 text-sm text-[#9ca3af]">{item.label} <span className="font-mono text-xs">base {item.value}</span></span>
            <output className="min-w-0 flex-1 break-all font-mono text-sm text-white">{value || '—'}</output>
            <button type="button" disabled={!value} onClick={() => copy(value, item.value)} className="rounded border border-[#2d2d44] px-3 py-1.5 text-xs text-[#9ca3af] hover:border-[#e94560] hover:text-white disabled:opacity-40">{copied === item.value ? 'Copied' : 'Copy'}</button>
          </div>
        })}
      </div>
      <p className="text-xs text-[#9ca3af]">Supports signed integers and large values without losing precision.</p>
    </div>
  )
}
