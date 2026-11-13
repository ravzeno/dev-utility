'use client'

import { useState } from 'react'

export function useTwoWayConverter<Direction extends string>(
  directions: readonly [Direction, Direction],
  transform: (input: string, direction: Direction) => string,
  errorMessage: string,
) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [direction, setDirection] = useState<Direction>(directions[0])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const convert = () => {
    setError('')
    try {
      setOutput(transform(input, direction))
    } catch {
      setError(errorMessage)
    }
  }

  const swap = () => {
    setDirection((current) => current === directions[0] ? directions[1] : directions[0])
    setInput(output)
    setOutput(input)
    setError('')
  }

  const copyToClipboard = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return { input, setInput, output, direction, setDirection, error, setError, copied, convert, swap, copyToClipboard, clear }
}
