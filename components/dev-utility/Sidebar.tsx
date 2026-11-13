'use client'

import { useState, useEffect, useCallback } from 'react'
import { tools } from './tools'
import { useFavorites } from './tools/useFavorites'
import { useActiveTool } from './tools/useActiveTool'
import { Search, Star, X, Menu, ArrowLeftRight, Braces, Boxes, Sparkles } from 'lucide-react'
import type { ToolRegistryItem } from './tools/types'

const NAVIGATION_GROUPS = [
  {
    label: 'เริ่มจากตรงนี้',
    icon: ArrowLeftRight,
    ids: ['json-editor', 'base64', 'url-encode', 'data-format', 'timestamp', 'jwt-decoder'],
  },
  {
    label: 'ข้อความและข้อมูล',
    icon: Braces,
    ids: ['case-converter', 'string-escape', 'html-entities', 'url-escape', 'regex', 'hash', 'text-diff'],
  },
  {
    label: 'เครื่องมือระบบ',
    icon: Boxes,
    ids: ['http-status', 'permission', 'docker-compose', 'cron-builder', 'mermaid', 'number-base'],
  },
  {
    label: 'สร้างและอ้างอิง',
    icon: Sparkles,
    ids: ['uuid', 'qrcode', 'color-converter', 'lorem'],
  },
]

function NavItem({ tool, compact = false, active, favorite, onSelect, onToggleFavorite }: {
  tool: ToolRegistryItem
  compact?: boolean
  active: boolean
  favorite: boolean
  onSelect: (id: string) => void
  onToggleFavorite: (id: string) => void
}) {
  return (
    <div className="group/nav flex items-center">
      <a
        href={`?tool=${encodeURIComponent(tool.id)}`}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          onSelect(tool.id)
        }}
        aria-current={active ? 'page' : undefined}
        className={`sidebar-tool ${active ? 'sidebar-tool-active' : ''} ${compact ? 'sidebar-tool-compact' : ''}`}
      >
        <span className="truncate">{tool.name}</span>
      </a>
      <button
        type="button"
        onClick={() => onToggleFavorite(tool.id)}
        aria-label={favorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
        className={`favorite-toggle ${favorite ? 'favorite-toggle-active' : ''}`}
        title={favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star className={`size-3.5 ${favorite ? 'fill-current' : ''}`} />
      </button>
    </div>
  )
}

export function Sidebar() {
  const { activeTool, setActiveTool } = useActiveTool()
  const { favorites, toggleFavorite, isFavorite, loaded } = useFavorites()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const favoriteTools = tools.filter((t) => favorites.includes(t.id))

  const normalizedQuery = searchQuery.toLowerCase()
  const filteredTools = normalizedQuery
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(normalizedQuery) ||
          t.description?.toLowerCase().includes(normalizedQuery) ||
          t.keywords?.some((k) => k.toLowerCase().includes(normalizedQuery))
      )
    : tools

  const groupedTools = NAVIGATION_GROUPS.map((group) => ({
    ...group,
    tools: group.ids
      .map((id) => filteredTools.find((tool) => tool.id === id))
      .filter((tool): tool is (typeof tools)[number] => Boolean(tool)),
  })).filter((group) => group.tools.length > 0)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setSearchQuery('')
      }
    },
    []
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleSelectTool = (toolId: string) => {
    setActiveTool(toolId)
    setShowSearch(false)
    setSearchQuery('')
    setSidebarOpen(false)
  }

  const renderNavItem = (tool: ToolRegistryItem, compact = false) => (
    <NavItem key={tool.id} tool={tool} compact={compact} active={activeTool === tool.id}
      favorite={isFavorite(tool.id)} onSelect={handleSelectTool} onToggleFavorite={toggleFavorite} />
  )

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label={sidebarOpen ? 'Close tools menu' : 'Open tools menu'}
        className="fixed bottom-4 left-4 z-50 flex size-11 items-center justify-center rounded-xl border border-[#334362] bg-[#141e33] text-[#eaf0ff] shadow-lg shadow-black/30 lg:hidden"
      >
        {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Sidebar */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close tools menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-[#070b14]/75 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`app-sidebar fixed inset-y-0 left-0 z-40 flex w-[292px] shrink-0 -translate-x-full flex-col transition-transform duration-200 lg:sticky lg:top-[72px] lg:z-0 lg:h-[calc(100vh-72px)] lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : ''}`}
      >
        <div className="border-b border-[#243150] px-4 pb-4 pt-5 lg:pt-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <p className="text-sm font-semibold text-[#e7edff]">เครื่องมือทั้งหมด</p>
              <p className="mt-0.5 text-xs text-[#7484a5]">{tools.length} เครื่องมือ พร้อมใช้</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex size-8 items-center justify-center rounded-lg text-[#91a0be] hover:bg-[#1a2741] hover:text-white lg:hidden"
              aria-label="Close tools menu"
            >
              <X className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="search-trigger"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">ค้นหาเครื่องมือ</span>
            <kbd className="rounded border border-[#334360] bg-[#111a2d] px-1.5 py-0.5 font-mono text-[10px] text-[#94a4c6]">⌘ K</kbd>
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Tools">
          {loaded && favoriteTools.length > 0 && (
            <section>
              <div className="nav-section-title text-[#d6a653]">
                <Star className="size-3 fill-current" />
                Favorites
              </div>
              <div className="mt-1.5 space-y-0.5">
                {favoriteTools.map((tool) => renderNavItem(tool, true))}
              </div>
            </section>
          )}

          {groupedTools.map((group) => {
            const Icon = group.icon
            return (
              <section key={group.label}>
                <div className="nav-section-title">
                  <Icon className="size-3.5" />
                  {group.label}
                </div>
                <div className="mt-1.5 space-y-0.5">
                  {group.tools.map((tool) => renderNavItem(tool))}
                </div>
              </section>
            )
          })}
        </nav>
      </aside>

      {/* Search Modal */}
      {showSearch && (
        <>
          <div
            className="fixed inset-0 z-50 bg-[#070b14]/80 backdrop-blur-sm"
            onClick={() => { setShowSearch(false); setSearchQuery('') }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="ค้นหาเครื่องมือ"
            className="fixed left-1/2 top-[12%] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 sm:top-[18%]"
          >
              <div className="overflow-hidden rounded-2xl border border-[#334361] bg-[#10192a] shadow-2xl shadow-black/50">
                <div className="flex items-center gap-3 border-b border-[#293753] p-4">
                  <Search className="size-5 text-[#90a0c2]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="พิมพ์ชื่อเครื่องมือ หรือสิ่งที่ต้องการทำ"
                    autoFocus
                    className="flex-1 bg-transparent text-base text-[#edf2ff] outline-none placeholder:text-[#71809e]"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowSearch(false); setSearchQuery('') }}
                    aria-label="ปิดการค้นหา"
                    className="rounded-lg p-1.5 text-[#91a0be] hover:bg-[#1c2a45] hover:text-white"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
                  {filteredTools
                    .map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => handleSelectTool(tool.id)}
                        className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#1a2741]"
                      >
                        <div>
                          <div className="text-sm font-medium text-[#ecf1ff]">{tool.name}</div>
                          <div className="mt-0.5 text-xs leading-5 text-[#8b9bbb]">{tool.description}</div>
                        </div>
                      </button>
                    ))}
                  {filteredTools.length === 0 && (
                    <div className="p-6 text-center text-sm text-[#8b9bbb]">ไม่พบเครื่องมือที่ตรงกับคำค้นหา</div>
                  )}
                </div>
              </div>
          </div>
        </>
      )}
    </>
  )
}
