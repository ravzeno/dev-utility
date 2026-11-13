'use client'

import { useState, useCallback, useRef } from 'react'
import { toCanvas, toString } from 'qrcode'

type CenterType = 'none' | 'logo' | 'text' | 'both'

interface CenterTextOptions {
  text: string
  fontFamily: string
  fontSize: number
  color: string
  bgColor: string
  padding: number
}

interface LogoOptions {
  url: string
  size: number
}

interface QRCodeOptions {
  width: number
  margin: number
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  color: {
    dark: string
    light: string
  }
}

type OutputFormat = 'dataUrl' | 'svg'
type DownloadFormat = 'png' | 'svg'

const FONTS = [
  'Arial',
  'Helvetica',
  'Roboto',
  'Open Sans',
  'Lato',
  'Verdana',
  'Georgia',
  'Times New Roman',
  'Courier New',
]

const SVG_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

function escapeSvg(value: string) {
  return value.replace(/[&<>"']/g, (character) => SVG_ENTITIES[character])
}

export function QrCodeTool() {
  const [input, setInput] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [svgString, setSvgString] = useState('')
  const [format, setFormat] = useState<OutputFormat>('dataUrl')
  const [error, setError] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [generatedSettings, setGeneratedSettings] = useState('')
  const [generating, setGenerating] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [centerType, setCenterType] = useState<CenterType>('logo')
  const [textOptions, setTextOptions] = useState<CenterTextOptions>({
    text: '',
    fontFamily: 'Arial',
    fontSize: 14,
    color: '#000000',
    bgColor: '#FFFFFF',
    padding: 4,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [options, setOptions] = useState<QRCodeOptions>({
    width: 256,
    margin: 4,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#FFFFFF' },
  })

  const [logo, setLogo] = useState<LogoOptions>({
    url: '',
    size: 20,
  })

  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('png')

  const hasCenterContent = centerType !== 'none'
  const showLogo = centerType === 'logo' || centerType === 'both'
  const showText = centerType === 'text' || centerType === 'both'
  const currentSettings = JSON.stringify({ input, options, centerType, logoPreview, logo, textOptions })
  const isOutdated = Boolean(generatedSettings && generatedSettings !== currentSettings)

  const drawCenterContent = useCallback(async (ctx: CanvasRenderingContext2D, qrSize: number) => {
    if (!hasCenterContent) return null

    const logoSize = showLogo && logoPreview ? (qrSize * logo.size) / 100 : 0
    const textHeight = showText && textOptions.text ? textOptions.fontSize + textOptions.padding * 2 : 0
    const totalHeight = logoSize + (showText && textOptions.text ? textHeight + 4 : 0)
    const centerY = (qrSize - totalHeight) / 2

    if (showText && textOptions.text) {
      const textBgHeight = textOptions.fontSize + textOptions.padding * 2
      const textBgY = centerY + logoSize + (logoSize > 0 ? 4 : 0)
      const textBgWidth = qrSize * 0.5
      const textBgX = (qrSize - textBgWidth) / 2

      ctx.fillStyle = textOptions.bgColor
      ctx.fillRect(textBgX, textBgY, textBgWidth, textBgHeight)

      ctx.fillStyle = textOptions.color
      ctx.font = `${textOptions.fontSize}px "${textOptions.fontFamily}", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(textOptions.text, qrSize / 2, textBgY + textBgHeight / 2)
    }

    if (showLogo && logoPreview) {
      const logoY = centerY
      const logoX = (qrSize - logoSize) / 2

      let imgSrc = logoPreview

      if (!logoPreview.startsWith('data:')) {
        const response = await fetch(logoPreview)
        if (!response.ok) throw new Error('Failed to load image')
        const blob = await response.blob()
        imgSrc = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Failed to read image'))
          reader.readAsDataURL(blob)
        })
      }

        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('Failed to load logo'))
          img.src = imgSrc
        })

        ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
      return imgSrc
    }
    return null
  }, [hasCenterContent, showLogo, showText, logoPreview, logo, textOptions])

  const generateQRCode = useCallback(async () => {
    if (!input.trim()) {
      setError('Please enter text or URL')
      return
    }

    setError(null)
    setLogoError(null)
    setGenerating(true)

    try {
      const canvas = document.createElement('canvas')
      const ecLevel = hasCenterContent ? 'H' : options.errorCorrectionLevel
      await toCanvas(canvas, input, {
        width: options.width,
        margin: options.margin,
        errorCorrectionLevel: ecLevel,
        color: options.color,
      })

      let finalDataUrl = canvas.toDataURL('image/png')

      const ctx = canvas.getContext('2d')
      let embeddedLogo: string | null = null
      if (ctx && hasCenterContent) {
        const qrSize = canvas.width
        embeddedLogo = await drawCenterContent(ctx, qrSize)
        finalDataUrl = canvas.toDataURL('image/png')
      }

      setQrDataUrl(finalDataUrl)

      {
        const svgContent = await toString(input, {
          type: 'svg',
          width: options.width,
          margin: options.margin,
          errorCorrectionLevel: ecLevel,
          color: options.color,
        })
        let overlay = ''

        if (hasCenterContent) {
          const qrSize = canvas.width
          const logoSize = showLogo && logoPreview ? (qrSize * logo.size) / 100 : 0
          const textHeight = showText && textOptions.text ? textOptions.fontSize + textOptions.padding * 2 : 0
          const totalHeight = logoSize + (showText && textOptions.text ? textHeight + 4 : 0)
          const centerY = (qrSize - totalHeight) / 2

          if (showText && textOptions.text) {
            const textBgHeight = textOptions.fontSize + textOptions.padding * 2
            const textBgY = centerY + logoSize + (logoSize > 0 ? 4 : 0)
            const textBgWidth = qrSize * 0.5
            const textBgX = (qrSize - textBgWidth) / 2

            overlay += `<rect x="${textBgX}" y="${textBgY}" width="${textBgWidth}" height="${textBgHeight}" fill="${escapeSvg(textOptions.bgColor)}"/>`
            overlay += `<text x="${qrSize / 2}" y="${textBgY + textBgHeight / 2}" font-family="${escapeSvg(textOptions.fontFamily)}, sans-serif" font-size="${textOptions.fontSize}" fill="${escapeSvg(textOptions.color)}" text-anchor="middle" dominant-baseline="middle">${escapeSvg(textOptions.text)}</text>`
          }

          if (showLogo && embeddedLogo) {
            const logoY = centerY
            const logoX = (qrSize - logoSize) / 2

            overlay += `<image href="${escapeSvg(embeddedLogo)}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}"/>`
          }
        }

        const viewBoxWidth = Number(svgContent.match(/viewBox="0 0 ([\d.]+)/)?.[1])
        if (!viewBoxWidth) throw new Error('Invalid QR SVG')
        setSvgString(svgContent.replace('</svg>', `<g transform="scale(${viewBoxWidth / canvas.width})">${overlay}</g></svg>`))
      }
      setGeneratedSettings(currentSettings)
    } catch {
      setError('Could not generate the QR code. Check the image URL or upload an image, then try again.')
    } finally {
      setGenerating(false)
    }
  }, [input, options, hasCenterContent, showLogo, showText, logoPreview, logo, textOptions, drawCenterContent, currentSettings])

  const handleLogoUrlChange = useCallback((url: string) => {
    setLogo({ ...logo, url })
    if (url) {
      setLogoPreview(url)
      setLogoError(null)
    } else {
      setLogoPreview(null)
    }
  }, [logo])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setLogoPreview(result)
      setLogo({ ...logo, url: '' })
      setLogoError(null)
    }
    reader.readAsDataURL(file)
  }, [logo])

  const handleCenterTypeChange = useCallback((type: CenterType) => {
    setCenterType(type)
  }, [])

  const handleCopy = useCallback(async () => {
    const textToCopy = format === 'dataUrl' ? qrDataUrl : svgString
    if (!textToCopy) return
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [format, qrDataUrl, svgString])

  const handleDownload = useCallback(() => {
    if (downloadFormat === 'png' && qrDataUrl) {
      const link = document.createElement('a')
      link.download = `qrcode-${Date.now()}.png`
      link.href = qrDataUrl
      link.click()
    } else if (downloadFormat === 'svg' && svgString) {
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `qrcode-${Date.now()}.svg`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }
  }, [downloadFormat, qrDataUrl, svgString])

  const handleClear = useCallback(() => {
    setInput('')
    setQrDataUrl('')
    setSvgString('')
    setGeneratedSettings('')
    setError(null)
    setLogoError(null)
    setLogoPreview(null)
    setCenterType('logo')
    setLogo({
      url: '',
      size: 20,
    })
    setTextOptions({
      text: '',
      fontFamily: 'Arial',
      fontSize: 14,
      color: '#000000',
      bgColor: '#FFFFFF',
      padding: 4,
    })
  }, [])

  const previewContent = !isOutdated && !generating ? (format === 'dataUrl' ? qrDataUrl : svgString) : ''

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(270px,0.8fr)] lg:gap-10">
        <div className="space-y-5">
          <div><h3 className="text-base font-semibold text-[var(--foreground)]">Content</h3><p className="mt-1 text-sm text-[var(--muted)]">Enter the link or text people will open when they scan.</p></div>

          <div>
            <label htmlFor="qr-input" className="mb-2 block text-sm font-medium text-[var(--foreground)]">Text or URL</label>
            <textarea
              id="qr-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text or URL..."
              className="min-h-28 w-full resize-y rounded-md border border-[var(--border)] bg-[var(--surface-raised)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)]"
            />
          </div>

          <button
            type="button"
            onClick={generateQRCode}
            disabled={generating}
            className="rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {generating ? 'Generating…' : isOutdated ? 'Update QR code' : 'Generate QR code'}
          </button>

          <details className="group border-t border-[var(--border)] pt-4">
            <summary className="cursor-pointer text-sm font-medium text-[var(--foreground)]">QR settings</summary>
            <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="qr-width" className="block text-xs text-[var(--muted)] mb-1">Width (px)</label>
              <input
                id="qr-width"
                type="number"
                value={options.width}
                onChange={(e) => setOptions({ ...options, width: parseInt(e.target.value) || 256 })}
                min={64}
                max={512}
                className="w-full p-2 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label htmlFor="qr-margin" className="block text-xs text-[var(--muted)] mb-1">Margin</label>
              <input
                id="qr-margin"
                type="number"
                value={options.margin}
                onChange={(e) => setOptions({ ...options, margin: parseInt(e.target.value) || 0 })}
                min={0}
                max={10}
                className="w-full p-2 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="qr-dark" className="block text-xs text-[var(--muted)] mb-1">Dark Color</label>
              <input
                id="qr-dark"
                type="color"
                value={options.color.dark}
                onChange={(e) => setOptions({ ...options, color: { ...options.color, dark: e.target.value } })}
                className="w-full h-10 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="qr-light" className="block text-xs text-[var(--muted)] mb-1">Light Color</label>
              <input
                id="qr-light"
                type="color"
                value={options.color.light}
                onChange={(e) => setOptions({ ...options, color: { ...options.color, light: e.target.value } })}
                className="w-full h-10 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="qr-correction" className="block text-xs text-[var(--muted)] mb-1">
              Error Correction
              {hasCenterContent && <span className="text-[var(--primary)] ml-1">(Auto: H)</span>}
            </label>
            <select
              id="qr-correction"
              value={options.errorCorrectionLevel}
              onChange={(e) => setOptions({ ...options, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
              disabled={hasCenterContent}
              className="w-full p-2 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg text-white text-sm focus:outline-none focus:border-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="L">L (7%) - Low</option>
              <option value="M">M (15%) - Medium</option>
              <option value="Q">Q (25%) - Quartile</option>
              <option value="H">H (30%) - High</option>
            </select>
          </div>

          <div>
            <label htmlFor="qr-format" className="block text-xs text-[var(--muted)] mb-1">Copy format</label>
            <select
              id="qr-format"
              value={format}
              onChange={(e) => setFormat(e.target.value as OutputFormat)}
              className="w-full p-2 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg text-white text-sm focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="dataUrl">Data URL (Base64)</option>
              <option value="svg">SVG String</option>
            </select>
          </div>
            </div>
          </details>
        </div>

        <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Preview</h3>
            <span className="text-xs text-[var(--muted)]">{options.width} × {options.width} px</span>
          </div>

          <div className="flex items-center justify-center min-h-[200px] bg-white rounded-lg p-4">
            {error ? (
              <span role="alert" className="text-sm text-red-800">{error}</span>
            ) : isOutdated || generating ? (
              <span className="text-center text-sm text-slate-600">{generating ? 'Generating QR code…' : 'Settings changed. Select Update QR code to refresh.'}</span>
            ) : qrDataUrl && format === 'dataUrl' ? (
              // The source is an in-memory data URL produced by this component, not a remote image.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR Code" className="max-w-full" />
            ) : svgString && format === 'svg' ? (
              <div dangerouslySetInnerHTML={{ __html: svgString }} className="max-w-full [&>svg]:max-w-full" />
            ) : (
              <span className="text-sm text-slate-600">Your QR code will appear here</span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-[var(--muted)]">Test with a phone before sharing. Strong contrast and a smaller center image help scanning.</p>

          {previewContent && !error && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Download format"
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value as DownloadFormat)}
                className="flex-1 p-2 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg text-white text-xs focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
              </select>
              <button
                onClick={handleDownload}
                className="flex-1 rounded-md bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-90"
              >
                Download {downloadFormat.toUpperCase()}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:border-[var(--primary)]"
              >
                {copied ? 'Copied' : format === 'svg' ? 'Copy SVG' : 'Copy data URL'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div><h3 className="text-sm font-semibold text-[var(--foreground)]">Center content</h3><p className="mt-1 text-xs text-[var(--muted)]">Optionally add an image or label.</p></div>
          <div className="flex flex-wrap gap-2">
            {(['none', 'logo', 'text', 'both'] as CenterType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleCenterTypeChange(type)}
                aria-pressed={centerType === type}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  centerType === type
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--border)] hover:text-white hover:border-[var(--primary)]'
                }`}
              >
                {type === 'none' ? 'None' : type === 'logo' ? 'Image' : type === 'text' ? 'Text' : 'Image + text'}
              </button>
            ))}
          </div>
        </div>

        {showLogo && (
          <div className="mb-4">
            <h4 className="text-xs text-[var(--muted)] mb-3 pb-2 border-b border-[var(--border)]">Add an image without a border</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label htmlFor="qr-logo-url" className="block text-xs text-[var(--muted)]">Image URL</label>
                <input
                  id="qr-logo-url"
                  type="text"
                  value={logo.url}
                  onChange={(e) => handleLogoUrlChange(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full p-2 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg text-white text-xs focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted)]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[var(--muted)]">Upload File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-2 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg text-[var(--muted)] text-xs hover:text-white hover:border-[var(--primary)] transition-all text-left truncate"
                >
                  {logoPreview && !logo.url ? '✓ File selected' : 'Choose file...'}
                </button>
              </div>

              <div className="space-y-1">
                <label htmlFor="qr-logo-size" className="block text-xs text-[var(--muted)]">Size ({logo.size}%)</label>
                <input
                  id="qr-logo-size"
                  type="range"
                  min={5}
                  max={30}
                  value={logo.size}
                  onChange={(e) => setLogo({ ...logo, size: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[var(--surface-raised)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                />
                <p className="text-xs text-[var(--muted)]">Larger images can make the code harder to scan. Test before sharing.</p>
              </div>

            </div>
          </div>
        )}

        {showText && (
          <div>
            <h4 className="text-xs text-[var(--muted)] mb-3 pb-2 border-b border-[var(--border)]">Text</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-[var(--muted)]">Text</label>
                <input
                  type="text"
                  value={textOptions.text}
                  onChange={(e) => setTextOptions({ ...textOptions, text: e.target.value })}
                  placeholder="Your brand"
                  maxLength={20}
                  className="w-full p-2 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg text-white text-xs focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted)]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[var(--muted)]">Font</label>
                <select
                  value={textOptions.fontFamily}
                  onChange={(e) => setTextOptions({ ...textOptions, fontFamily: e.target.value })}
                  className="w-full p-2 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg text-white text-xs focus:outline-none focus:border-[var(--primary)]"
                >
                  {FONTS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[var(--muted)]">Size ({textOptions.fontSize}px)</label>
                <input
                  type="range"
                  min={10}
                  max={32}
                  value={textOptions.fontSize}
                  onChange={(e) => setTextOptions({ ...textOptions, fontSize: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[var(--surface-raised)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[var(--muted)]">Text Color</label>
                <input
                  type="color"
                  value={textOptions.color}
                  onChange={(e) => setTextOptions({ ...textOptions, color: e.target.value })}
                  className="w-full h-8 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[var(--muted)]">Bg Color</label>
                <input
                  type="color"
                  value={textOptions.bgColor}
                  onChange={(e) => setTextOptions({ ...textOptions, bgColor: e.target.value })}
                  className="w-full h-8 bg-[var(--surface-raised)] border-2 border-[var(--border)] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {logoError && (
          <p className="mt-3 text-xs text-yellow-400">{logoError}</p>
        )}
      </div>

      {svgString && format === 'svg' && !isOutdated && !generating && !error && (
        <div className="p-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg">
          <h3 className="text-sm text-[var(--muted)] font-medium mb-2">SVG Output</h3>
          <pre className="p-3 bg-[var(--surface-raised)] rounded-lg overflow-auto max-h-40 text-xs font-mono text-[var(--muted)]">
            {svgString}
          </pre>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-transparent text-[var(--muted)] rounded-lg font-medium border-2 border-[var(--border)] hover:text-white hover:border-[var(--primary)] transition-all text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
