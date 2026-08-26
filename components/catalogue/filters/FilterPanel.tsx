'use client'

import { motion } from 'motion/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { applyFilters, type Filters, type PowerBucket } from '@/lib/filters'
import type { Product } from '@/lib/catalogue'
import { useFiltersOpen } from '@/components/catalogue/FiltersOpenContext'
import BadgeInput from './BadgeInput'
import FilterSection from './FilterSection'
import RangeDual from './RangeDual'
import TagsEditor from './TagsEditor'
import FilterFooter from './FilterFooter'

// Value lists match the catalogue fixture's own generators exactly
// (content/products.ts) — not re-derived from the live product list, same
// as the original's filterOptions source.
const MANUFACTURERS = ['PIROFF', 'Joker', 'Maxsem', 'РусСалют', 'Fieria']
const IGNITIONS = ['терочный', 'ударный', 'фитильный']
const VIEWS = ['жуки', 'лента', 'треугольник', 'чесночок', 'шарик', 'хлопушка']
const SIZES = ['маленький', 'большой']
const SHOTS_PRESETS = [1, 2, 3, 4, 50, 100]
const POWERS: PowerBucket[] = ['слабый', 'средний', 'мощный']

type StagedFilters = Pick<
	Filters,
	'manufacturers' | 'shots' | 'power' | 'ignitionType' | 'view' | 'size' | 'tags' | 'price' | 'duration'
>

function parseInitial(sp: URLSearchParams): StagedFilters {
	const list = (key: string) => {
		const v = sp.get(key)
		return v ? v.split(',').filter(Boolean) : []
	}
	const num = (key: string) => {
		const v = sp.get(key)
		return v && v !== '' ? Number(v) : undefined
	}
	return {
		manufacturers: list('manufacturer'),
		shots: list('shots').map(Number),
		power: list('power') as PowerBucket[],
		ignitionType: list('ignition'),
		view: list('view'),
		size: list('size'),
		tags: list('tags'),
		price: { min: num('priceMin'), max: num('priceMax') },
		duration: { min: num('durationMin'), max: num('durationMax') },
	}
}

const toggle = (arr: string[], val: string) =>
	arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

// The biggest restored gap: the original's whole filter feature (7
// accordion sections, tag chips, dual-range sliders) had no migrated
// counterpart at all — lib/filters.ts already implements the matching
// engine, this wires a real UI on top of it. Staged-then-apply, same as
// the original: local state drives the live "найдено N" preview count,
// the URL (the actual source of truth for the rendered grid) only changes
// on "показать"/"сбросить все".
export default function FilterPanel({ products }: { products: Product[] }) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const { close } = useFiltersOpen()

	const [staged, setStaged] = useState<StagedFilters>(() => parseInitial(searchParams))

	const previewCount = applyFilters(products, staged as Filters).length

	const setField = <K extends keyof StagedFilters>(key: K, value: StagedFilters[K]) =>
		setStaged(prev => ({ ...prev, [key]: value }))

	const handleApply = () => {
		const next = new URLSearchParams(searchParams.toString())
		const setOrDelete = (key: string, value: string) => {
			if (value) next.set(key, value)
			else next.delete(key)
		}
		setOrDelete('manufacturer', (staged.manufacturers ?? []).join(','))
		setOrDelete('shots', (staged.shots ?? []).join(','))
		setOrDelete('power', (staged.power ?? []).join(','))
		setOrDelete('ignition', (staged.ignitionType ?? []).join(','))
		setOrDelete('view', (staged.view ?? []).join(','))
		setOrDelete('size', (staged.size ?? []).join(','))
		setOrDelete('tags', (staged.tags ?? []).join(','))
		setOrDelete('priceMin', staged.price?.min != null ? String(staged.price.min) : '')
		setOrDelete('priceMax', staged.price?.max != null ? String(staged.price.max) : '')
		setOrDelete('durationMin', staged.duration?.min != null ? String(staged.duration.min) : '')
		setOrDelete('durationMax', staged.duration?.max != null ? String(staged.duration.max) : '')
		router.push(`${pathname}?${next.toString()}`)
		close()
	}

	const handleReset = () => {
		const next = new URLSearchParams(searchParams.toString())
		for (const key of [
			'manufacturer',
			'shots',
			'power',
			'ignition',
			'view',
			'size',
			'tags',
			'priceMin',
			'priceMax',
			'durationMin',
			'durationMax',
		]) {
			next.delete(key)
		}
		setStaged({})
		router.push(`${pathname}?${next.toString()}`)
	}

	const priceMin = staged.price?.min ?? 0
	const priceMax = staged.price?.max ?? 20000
	const durationMin = staged.duration?.min ?? 0
	const durationMax = staged.duration?.max ?? 120

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			exit="hidden"
			variants={{
				// The original's SubcategoryOverlay never unmounts on close — it
				// animates height/opacity to 0 first (0.25s/0.2s, slower than the
				// 0.18s open) and only then disappears. Ours does unmount on
				// close (CatalogueSidebarSlot swaps back to the category nav), so
				// this exit variant + the AnimatePresence in CatalogueSidebarSlot
				// reproduce the same visible close animation instead of an
				// instant cut.
				hidden: {
					height: 0,
					opacity: 0,
					transition: { height: { duration: 0.25, ease: 'easeOut' }, opacity: { duration: 0.2, ease: 'easeOut' } },
				},
				visible: {
					height: 'auto',
					opacity: 1,
					transition: { height: { duration: 0.18, ease: 'easeOut' }, opacity: { duration: 0.18, ease: 'easeOut' } },
				},
			}}
			className="flex w-[240px] flex-col overflow-hidden rounded-[20px] bg-white drop-shadow-[0_0_5px_rgba(0,0,0,0.2)]"
		>
			<div className="relative top-[2px] px-5 pt-[10px]">
				<div className="font-baron text-lg text-[#625A51] lowercase">фильтры</div>
				<button
					type="button"
					onClick={close}
					aria-label="Закрыть"
					title="Закрыть"
					className="absolute top-4 right-5 grid h-6 w-6 cursor-pointer place-items-center rounded text-[#625A51] transition-colors hover:text-[#BD52E9] focus:outline-none"
				>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
						<path
							d="M14.0625 5.9375L5.9375 14.0625M5.9375 5.9375L14.0625 14.0625"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</div>
			<div className="mx-auto mt-2.5 h-[2px] w-[220px] rounded-[20px] bg-[#EFEBE6]" />

			<div className="scroll-hidden max-h-[600px] overflow-y-auto px-[10px] pt-3 pb-2">
					<div className="mb-3">
						<TagsEditor value={staged.tags ?? []} onChange={v => setField('tags', v)} />
					</div>
					<Divider />

					<div className="mt-3 mb-3">
						<div className="font-baron mb-2 text-[12px] text-black">Цена</div>
						<div className="mt-3 grid grid-cols-2 gap-[10px]">
							<BadgeInput label="от" value={priceMin} onChange={v => setField('price', { ...staged.price, min: v === '' ? undefined : v })} />
							<BadgeInput label="до" value={priceMax} onChange={v => setField('price', { ...staged.price, max: v === '' ? undefined : v })} />
						</div>
						<RangeDual
							min={0}
							max={20000}
							step={10}
							valueMin={priceMin}
							valueMax={priceMax}
							onChange={(lo, hi) => setField('price', { min: lo, max: hi })}
						/>
					</div>
					<Divider />

					<div className="mb-3">
						<FilterSection
							title="производитель"
							options={MANUFACTURERS}
							checkedValues={staged.manufacturers ?? []}
							onToggle={v => setField('manufacturers', toggle(staged.manufacturers ?? [], v))}
						/>
					</div>
					<Divider />

					<div className="mb-3">
						<FilterSection
							title="тип"
							options={IGNITIONS}
							checkedValues={staged.ignitionType ?? []}
							onToggle={v => setField('ignitionType', toggle(staged.ignitionType ?? [], v))}
						/>
					</div>
					<Divider />

					<div className="mb-3">
						<FilterSection
							title="количество хлопков"
							options={SHOTS_PRESETS.map(String)}
							checkedValues={(staged.shots ?? []).map(String)}
							onToggle={v => setField('shots', toggle((staged.shots ?? []).map(String), v).map(Number))}
						/>
					</div>
					<Divider />

					<div className="mb-3">
						<FilterSection
							title="мощность"
							options={POWERS}
							checkedValues={staged.power ?? []}
							onToggle={v => setField('power', toggle(staged.power ?? [], v) as PowerBucket[])}
						/>
					</div>
					<Divider />

					<div className="mb-3">
						<FilterSection
							title="вид"
							options={VIEWS}
							checkedValues={staged.view ?? []}
							onToggle={v => setField('view', toggle(staged.view ?? [], v))}
						/>
					</div>
					<Divider />

					<div className="mb-3">
						<FilterSection
							title="размер"
							options={SIZES}
							checkedValues={staged.size ?? []}
							onToggle={v => setField('size', toggle(staged.size ?? [], v))}
						/>
					</div>
					<Divider />

					<div className="mb-3">
						<div className="font-baron mb-2 text-[12px] text-black">время работы</div>
						<div className="mt-3 grid grid-cols-2 gap-[10px]">
							<BadgeInput label="от" value={durationMin} onChange={v => setField('duration', { ...staged.duration, min: v === '' ? undefined : v })} />
							<BadgeInput label="до" value={durationMax} onChange={v => setField('duration', { ...staged.duration, max: v === '' ? undefined : v })} />
						</div>
						<RangeDual
							min={0}
							max={120}
							step={1}
							valueMin={durationMin}
							valueMax={durationMax}
							onChange={(lo, hi) => setField('duration', { min: lo, max: hi })}
						/>
					</div>
			</div>

			<FilterFooter previewCount={previewCount} onApply={handleApply} onReset={handleReset} />
		</motion.div>
	)
}

function Divider() {
	return <div className="mx-auto h-[2px] w-[204px] rounded-[20px] bg-[#EFEBE6]" />
}
