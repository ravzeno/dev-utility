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
  bgColor: string
  padding: number
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
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#FFFFFF' },
  })

  const [logo, setLogo] = useState<LogoOptions>({
    url: '',
    size: 20,
    bgColor: '#FFFFFF',
    padding: 4,
  })

  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('png')

  const hasCenterContent = centerType !== 'none'
  const showLogo = centerType === 'logo' || centerType === 'both'
  const showText = centerType === 'text' || centerType === 'both'

  const drawCenterContent = useCallback(async (ctx: CanvasRenderingContext2D, qrSize: number) => {
    if (!hasCenterContent) return

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

      ctx.fillStyle = logo.bgColor
      ctx.fillRect(
        logoX - logo.padding,
        logoY - logo.padding,
        logoSize + logo.padding * 2,
        logoSize + logo.padding * 2
      )

      try {
        let imgSrc = logoPreview

        if (!logoPreview.startsWith('data:')) {
          try {
            const response = await fetch(logoPreview)
            if (response.ok) {
              const blob = await response.blob()
              imgSrc = await new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.readAsDataURL(blob)
              })
            }
          } catch {
            imgSrc = logoPreview
          }
        }

        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('Failed to load logo'))
          img.src = imgSrc
        })

        ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
        setLogoError(null)
      } catch {
        setLogoError('Failed to load logo image. Skipping logo.')
      }
    }
  }, [hasCenterContent, showLogo, showText, logoPreview, logo, textOptions])

  const generateQRCode = useCallback(async () => {
    if (!input.trim()) {
      setError('Please enter text or URL')
      return
    }

    setError(null)

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
      if (ctx && hasCenterContent) {
        const qrSize = canvas.width
        await drawCenterContent(ctx, qrSize)
        finalDataUrl = canvas.toDataURL('image/png')
      }

      setQrDataUrl(finalDataUrl)

      if (format === 'svg') {
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

          if (showLogo && logoPreview) {
            const logoY = centerY
            const logoX = (qrSize - logoSize) / 2

            overlay += `<rect x="${logoX - logo.padding}" y="${logoY - logo.padding}" width="${logoSize + logo.padding * 2}" height="${logoSize + logo.padding * 2}" fill="${escapeSvg(logo.bgColor)}"/>`
            overlay += `<image href="${escapeSvg(logoPreview)}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}"/>`
          }
        }

        setSvgString(svgContent.replace('</svg>', `${overlay}</svg>`))
      } else {
        setSvgString('')
      }
    } catch {
      setError('Failed to generate QR code')
    }
  }, [input, format, options, hasCenterContent, showLogo, showText, logoPreview, logo, textOptions, drawCenterContent])

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
    setError(null)
    setLogoError(null)
    setLogoPreview(null)
    setCenterType('logo')
    setLogo({
      url: '',
      size: 20,
      bgColor: '#FFFFFF',
      padding: 4,
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

  const previewContent = qrDataUrl || (svgString && format === 'svg' ? svgString : null)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-[#0f0f23] border-2 border-[#2d2d44] rounded-lg space-y-4">
          <h3 className="text-sm text-[#9ca3af] font-medium">Input</h3>

          <div>
            <label className="block text-xs text-[#9ca3af] mb-1">Text or URL</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text or URL..."
              className="w-full h-24 p-2.5 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#e94560] placeholder:text-[#4a4a5a] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#9ca3af] mb-1">Width (px)</label>
              <input
                type="number"
                value={options.width}
                onChange={(e) => setOptions({ ...options, width: parseInt(e.target.value) || 256 })}
                min={64}
                max={512}
                className="w-full p-2 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#e94560]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9ca3af] mb-1">Margin</label>
              <input
                type="number"
                value={options.margin}
                onChange={(e) => setOptions({ ...options, margin: parseInt(e.target.value) || 0 })}
                min={0}
                max={10}
                className="w-full p-2 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#e94560]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#9ca3af] mb-1">Dark Color</label>
              <input
                type="color"
                value={options.color.dark}
                onChange={(e) => setOptions({ ...options, color: { ...options.color, dark: e.target.value } })}
                className="w-full h-10 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9ca3af] mb-1">Light Color</label>
              <input
                type="color"
                value={options.color.light}
                onChange={(e) => setOptions({ ...options, color: { ...options.color, light: e.target.value } })}
                className="w-full h-10 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#9ca3af] mb-1">
              Error Correction
              {hasCenterContent && <span className="text-[#e94560] ml-1">(Auto: H)</span>}
            </label>
            <select
              value={options.errorCorrectionLevel}
              onChange={(e) => setOptions({ ...options, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
              disabled={hasCenterContent}
              className="w-full p-2 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white text-sm focus:outline-none focus:border-[#e94560] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="L">L (7%) - Low</option>
              <option value="M">M (15%) - Medium</option>
              <option value="Q">Q (25%) - Quartile</option>
              <option value="H">H (30%) - High</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#9ca3af] mb-1">Output Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as OutputFormat)}
              className="w-full p-2 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white text-sm focus:outline-none focus:border-[#e94560]"
            >
              <option value="dataUrl">Data URL (Base64)</option>
              <option value="svg">SVG String</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-[#0f0f23] border-2 border-[#2d2d44] rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-[#9ca3af] font-medium">Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={generateQRCode}
                className="px-3 py-1.5 bg-[#e94560] text-white text-xs font-medium rounded-lg hover:bg-[#d63a52] transition-all"
              >
                Generate
              </button>
              <button
                onClick={handleCopy}
                disabled={!previewContent}
                className="px-3 py-1.5 bg-[#1a1a2e] text-[#9ca3af] text-xs font-medium rounded-lg border border-[#2d2d44] hover:text-white hover:border-[#e94560] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[200px] bg-white rounded-lg p-4">
            {error ? (
              <span className="text-[#e94560] text-sm">{error}</span>
            ) : qrDataUrl && format === 'dataUrl' ? (
              // The source is an in-memory data URL produced by this component, not a remote image.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR Code" className="max-w-full" />
            ) : svgString && format === 'svg' ? (
              <div dangerouslySetInnerHTML={{ __html: svgString }} className="max-w-full [&>svg]:max-w-full" />
            ) : (
              <span className="text-[#4a4a5a] text-sm">QR code will appear here</span>
            )}
          </div>

          {previewContent && (
            <div className="flex items-center gap-2">
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value as DownloadFormat)}
                className="flex-1 p-2 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white text-xs focus:outline-none focus:border-[#e94560]"
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
              </select>
              <button
                onClick={handleDownload}
                className="flex-1 px-3 py-2 bg-[#e94560] text-white text-xs font-medium rounded-lg hover:bg-[#d63a52] transition-all"
              >
                Download {downloadFormat.toUpperCase()}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-[#0f0f23] border-2 border-[#2d2d44] rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-[#9ca3af] font-medium">Center Content</h3>
          <div className="flex gap-2">
            {(['none', 'logo', 'text', 'both'] as CenterType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleCenterTypeChange(type)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  centerType === type
                    ? 'bg-[#e94560] text-white'
                    : 'bg-[#1a1a2e] text-[#9ca3af] border border-[#2d2d44] hover:text-white hover:border-[#e94560]'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {showLogo && (
          <div className="mb-4">
            <h4 className="text-xs text-[#9ca3af] mb-3 pb-2 border-b border-[#2d2d44]">Logo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-[#9ca3af]">Image URL</label>
                <input
                  type="text"
                  value={logo.url}
                  onChange={(e) => handleLogoUrlChange(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full p-2 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white text-xs focus:outline-none focus:border-[#e94560] placeholder:text-[#4a4a5a]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#9ca3af]">Upload File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-2 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-[#9ca3af] text-xs hover:text-white hover:border-[#e94560] transition-all text-left truncate"
                >
                  {logoPreview && !logo.url ? '✓ File selected' : 'Choose file...'}
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#9ca3af]">Size ({logo.size}%)</label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={logo.size}
                  onChange={(e) => setLogo({ ...logo, size: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[#1a1a2e] rounded-lg appearance-none cursor-pointer accent-[#e94560]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#9ca3af]">Bg Color</label>
                <input
                  type="color"
                  value={logo.bgColor}
                  onChange={(e) => setLogo({ ...logo, bgColor: e.target.value })}
                  className="w-full h-8 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {showText && (
          <div>
            <h4 className="text-xs text-[#9ca3af] mb-3 pb-2 border-b border-[#2d2d44]">Text</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-[#9ca3af]">Text</label>
                <input
                  type="text"
                  value={textOptions.text}
                  onChange={(e) => setTextOptions({ ...textOptions, text: e.target.value })}
                  placeholder="Your brand"
                  maxLength={20}
                  className="w-full p-2 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white text-xs focus:outline-none focus:border-[#e94560] placeholder:text-[#4a4a5a]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#9ca3af]">Font</label>
                <select
                  value={textOptions.fontFamily}
                  onChange={(e) => setTextOptions({ ...textOptions, fontFamily: e.target.value })}
                  className="w-full p-2 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg text-white text-xs focus:outline-none focus:border-[#e94560]"
                >
                  {FONTS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#9ca3af]">Size ({textOptions.fontSize}px)</label>
                <input
                  type="range"
                  min={10}
                  max={32}
                  value={textOptions.fontSize}
                  onChange={(e) => setTextOptions({ ...textOptions, fontSize: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[#1a1a2e] rounded-lg appearance-none cursor-pointer accent-[#e94560]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#9ca3af]">Text Color</label>
                <input
                  type="color"
                  value={textOptions.color}
                  onChange={(e) => setTextOptions({ ...textOptions, color: e.target.value })}
                  className="w-full h-8 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#9ca3af]">Bg Color</label>
                <input
                  type="color"
                  value={textOptions.bgColor}
                  onChange={(e) => setTextOptions({ ...textOptions, bgColor: e.target.value })}
                  className="w-full h-8 bg-[#1a1a2e] border-2 border-[#2d2d44] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {logoError && (
          <p className="mt-3 text-xs text-yellow-400">{logoError}</p>
        )}
      </div>

      {svgString && format === 'svg' && (
        <div className="p-4 bg-[#0f0f23] border-2 border-[#2d2d44] rounded-lg">
          <h3 className="text-sm text-[#9ca3af] font-medium mb-2">SVG Output</h3>
          <pre className="p-3 bg-[#1a1a2e] rounded-lg overflow-auto max-h-40 text-xs font-mono text-[#9ca3af]">
            {svgString}
          </pre>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-transparent text-[#9ca3af] rounded-lg font-medium border-2 border-[#2d2d44] hover:text-white hover:border-[#e94560] transition-all text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
