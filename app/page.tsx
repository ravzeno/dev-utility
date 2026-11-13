import { Braces } from 'lucide-react'
import { DevUtilityLayout } from '@/components/dev-utility/DevUtilityLayout'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>
}) {
  const { tool } = await searchParams

  return (
    <div className="app-shell min-h-screen">
      <header className="app-header">
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <Braces className="size-5" strokeWidth={2.4} />
            </div>
            <div>
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#edf2ef]">Dev Utility</span>
              <p className="mt-0.5 text-xs text-[#97a6a0]">เครื่องมือสำหรับงานพัฒนาประจำวัน</p>
            </div>
          </div>
          <span className="hidden font-mono text-xs text-[#97a6a0] sm:block">เครื่องมือสำหรับนักพัฒนา</span>
        </div>
      </header>
      <DevUtilityLayout initialTool={tool} />
    </div>
  )
}
