import { ToolRegistryItem } from './types'
import { Base64Tool } from './base64'
import { UrlEncodeTool } from './url-encode'
import { JsonEditorTool } from './json-editor'
import { UuidTool } from './uuid'
import { LoremTool } from './lorem'
import { HashTool } from './md5'
import { CaseConverterTool } from './case-converter'
import { ColorConverterTool } from './color-converter'
import { TimestampTool } from './timestamp'
import { JwtDecoderTool } from './jwt-decoder'
import { HttpStatusTool } from './http-status'
import { RegexTool } from './regex'
import { StringEscapeTool } from './string-escape'
import { HtmlEntitiesTool } from './html-entities'
import { UrlEscapeTool } from './url-escape'
import { DataFormatTool } from './data-format'
import { PermissionTool } from './permission'
import { DockerComposeTool } from './docker-compose'
import { CronBuilderTool } from './cron-builder'
import { MermaidTool } from './mermaid'
import { QrCodeTool } from './qrcode'
import { NumberBaseTool } from './number-base'
import { TextDiffTool } from './text-diff'

export const tools: ToolRegistryItem[] = [
  {
    id: 'base64',
    name: 'Base64',
    description: 'Encode and decode Base64 strings',
    category: 'Converter',
    type: 'two-way',
    component: <Base64Tool />,
    keywords: ['base64', 'encode', 'decode', 'btoa', 'atob'],
  },
  {
    id: 'url-encode',
    name: 'URL Encode',
    description: 'Encode and decode URL components',
    category: 'Converter',
    type: 'two-way',
    component: <UrlEncodeTool />,
    keywords: ['url', 'encode', 'decode', 'percent', 'component'],
  },
  {
    id: 'json-editor',
    name: 'JSON Editor',
    description: 'Edit JSON with tree and text views, add/delete nodes, search, undo/redo',
    category: 'Converter',
    type: 'freestyle',
    component: <JsonEditorTool />,
    keywords: ['json', 'editor', 'tree', 'view', 'edit', 'viewer', 'crud'],
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between camelCase, snake_case, PascalCase and more',
    category: 'Converter',
    type: 'one-way',
    component: <CaseConverterTool />,
    keywords: ['case', 'camel', 'snake', 'pascal', 'kebab', 'upper', 'lower', 'title'],
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Pick colors, convert between HEX, RGB, HSL and OKLCH formats',
    category: 'Converter',
    type: 'n-way',
    component: <ColorConverterTool />,
    keywords: ['color', 'hex', 'rgb', 'hsl', 'oklch', 'convert', 'picker'],
  },
  {
    id: 'hash',
    name: 'Hash Generator',
    description: 'Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes',
    category: 'Hash',
    type: 'one-way',
    component: <HashTool />,
    keywords: ['hash', 'sha1', 'sha256', 'sha384', 'sha512', 'digest', 'checksum'],
  },
  {
    id: 'uuid',
    name: 'UUID Generator',
    description: 'Generate random UUID v4 identifiers',
    category: 'Typo',
    type: 'generator',
    component: <UuidTool />,
    keywords: ['uuid', 'guid', 'generate', 'random', 'v4'],
  },
  {
    id: 'lorem',
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text',
    category: 'Typo',
    type: 'generator',
    component: <LoremTool />,
    keywords: ['lorem', 'ipsum', 'placeholder', 'dummy', 'text', 'generator'],
  },
  {
    id: 'timestamp',
    name: 'Timestamp',
    description: 'Convert between Unix timestamps and dates',
    category: 'Converter',
    type: 'freestyle',
    component: <TimestampTool />,
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'convert'],
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens with expiration check',
    category: 'Converter',
    type: 'freestyle',
    component: <JwtDecoderTool />,
    keywords: ['jwt', 'json', 'web', 'token', 'decode', 'header', 'payload'],
  },
  {
    id: 'http-status',
    name: 'HTTP Status',
    description: 'Quick reference for HTTP status codes',
    category: 'Snippet',
    type: 'snippet',
    component: <HttpStatusTool />,
    keywords: ['http', 'status', 'code', '200', '404', '500', 'response'],
  },
  {
    id: 'regex',
    name: 'Regex Tester',
    description: 'Test regular expressions with inline match highlighting',
    category: 'Converter',
    type: 'freestyle',
    component: <RegexTool />,
    keywords: ['regex', 'regular', 'expression', 'pattern', 'match', 'test'],
  },
  {
    id: 'string-escape',
    name: 'String Escape',
    description: 'Escape and unescape string literals (quotes, newlines, tabs, backslashes)',
    category: 'Converter',
    type: 'two-way',
    component: <StringEscapeTool />,
    keywords: ['string', 'escape', 'unescape', 'quotes', 'newlines', 'unicode'],
  },
  {
    id: 'html-entities',
    name: 'HTML Entities',
    description: 'Encode and decode HTML entities',
    category: 'Converter',
    type: 'two-way',
    component: <HtmlEntitiesTool />,
    keywords: ['html', 'entities', 'encode', 'decode', 'amp', 'lt', 'gt'],
  },
  {
    id: 'url-escape',
    name: 'URL Escape',
    description: 'Encode and decode URL components with encodeURIComponent',
    category: 'Converter',
    type: 'two-way',
    component: <UrlEscapeTool />,
    keywords: ['url', 'escape', 'encode', 'decode', 'percent', 'component'],
  },
  {
    id: 'data-format',
    name: 'Data Formats',
    description: 'Convert between JSON, YAML and CSV formats',
    category: 'Converter',
    type: 'n-way',
    component: <DataFormatTool />,
    keywords: ['json', 'yaml', 'csv', 'convert', 'data', 'format'],
  },
  {
    id: 'permission',
    name: 'Permission Calculator',
    description: 'Unix chmod permission calculator with octal and symbolic output',
    category: 'Converter',
    type: 'freestyle',
    component: <PermissionTool />,
    keywords: ['chmod', 'permission', 'unix', 'linux', 'octal', 'rwx'],
  },
  {
    id: 'docker-compose',
    name: 'Docker CLI ↔ Compose',
    description: 'Convert Docker CLI run commands to Docker Compose format and vice versa',
    category: 'Converter',
    type: 'two-way',
    component: <DockerComposeTool />,
    keywords: ['docker', 'compose', 'cli', 'run', 'yaml', 'container'],
  },
  {
    id: 'cron-builder',
    name: 'Cron Expression Builder',
    description: 'Build cron expressions with visual editor, presets, and next execution times',
    category: 'Converter',
    type: 'freestyle',
    component: <CronBuilderTool />,
    keywords: ['cron', 'expression', 'schedule', 'timer', 'job'],
  },
  {
    id: 'mermaid',
    name: 'Mermaid Diagram',
    description: 'Render and preview Mermaid diagrams with live SVG output',
    category: 'Converter',
    type: 'freestyle',
    component: <MermaidTool />,
    keywords: ['mermaid', 'diagram', 'flowchart', 'graph', 'chart', 'svg'],
  },
  {
    id: 'qrcode',
    name: 'QR Code',
    description: 'Generate QR codes for text or URLs with customizable colors and size',
    category: 'Converter',
    type: 'generator',
    component: <QrCodeTool />,
    keywords: ['qr', 'qrcode', 'code', 'generate', 'barcode', 'scan'],
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two texts and see added and removed lines',
    category: 'Converter',
    type: 'freestyle',
    component: <TextDiffTool />,
    keywords: ['diff', 'compare', 'text', 'lines', 'changes'],
  },
  {
    id: 'number-base',
    name: 'Number Base',
    description: 'Convert integers between binary, octal, decimal and hexadecimal',
    category: 'Converter',
    type: 'n-way',
    component: <NumberBaseTool />,
    keywords: ['number', 'base', 'binary', 'octal', 'decimal', 'hex', 'hexadecimal'],
  },
]
