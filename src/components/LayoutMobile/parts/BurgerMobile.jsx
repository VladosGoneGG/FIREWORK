// src/components/LayoutMobile/parts/BurgerMobile.jsx
import { AnimatePresence, motion } from 'framer-motion'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { setCategorySmart } from '../../../store/slices/categoriesSlice'
import { clearApplied } from '../../../store/slices/filtersSlice'
import {
	resetFilters,
	selectFilteredProducts,
	selectFilters,
	setFilters,
} from '../../../store/slices/productsSlice'

import BurgerCloseSvg from '../../BurgerCloseSvg/BurgerCloseSvg'
import BurgerSvg from '../../BurgerSvg/BurgerSvg'
import SubcategoryOverlay from '../../SubcategoryOverlay/SubcategoryOverlay'

const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()

/** Категории и их подкатегории из каталога */
function useCategoryTree() {
	const items = useSelector(s => s.products.items || [])
	return useMemo(() => {
		const map = new Map()
		for (const p of items) {
			const cat = norm(p?.category)
			const sub = (p?.subcategory ?? '').toString().trim()
			if (!cat) continue
			if (!map.has(cat)) map.set(cat, new Set())
			if (sub) map.get(cat).add(sub)
		}
		const list = [{ key: 'all', title: 'все', subs: [] }]
		for (const [cat, subs] of map)
			list.push({ key: cat, title: cat, subs: [...subs] })
		return list
	}, [items])
}

const mapStoreToForm = storeFilters => ({
	price: {
		min: storeFilters?.price?.min ?? 0,
		max: storeFilters?.price?.max ?? null,
	},
	types: storeFilters?.types || [],
	manufacturers: storeFilters?.manufacturers || [],
	shots: storeFilters?.shots || [],
	power: storeFilters?.power || [],
	inStockOnly: !!storeFilters?.inStockOnly,
	hasCertificate: !!storeFilters?.hasCertificate,
})

const drawerVariants = {
	closed: {
		x: '-100%',
		transition: { type: 'tween', duration: 0.22, ease: 'easeOut' },
	},
	open: {
		x: 0,
		transition: { type: 'tween', duration: 0.22, ease: 'easeOut' },
	},
}

const BurgerMobile = () => {
	const dispatch = useDispatch()
	const [open, setOpen] = useState(false)
	const [filtersOpen, setFiltersOpen] = useState(false)

	// АККОРДЕОН: какая категория раскрыта (как на десктопе)
	const [expandedId, setExpandedId] = useState(null)

	const categories = useCategoryTree()
	const resultsCount = useSelector(selectFilteredProducts).length
	const storeFilters = useSelector(selectFilters)

	const selectedKey = useSelector(s =>
		String(s.categories.selectedCategory || 'all')
			.trim()
			.toLowerCase()
	)

	const [form, setForm] = useState(() => mapStoreToForm(storeFilters))
	useEffect(() => setForm(mapStoreToForm(storeFilters)), [storeFilters])

	// Авто-раскрытие родителя, если выбран саб
	useEffect(() => {
		if (selectedKey === 'all') {
			setExpandedId(null)
			return
		}
		// найти родителя по сабу
		for (const cat of categories) {
			if (cat.key === 'all') continue
			if (cat.key === selectedKey || cat.subs.map(norm).includes(selectedKey)) {
				setExpandedId(cat.key)
				break
			}
		}
	}, [selectedKey, categories])

	const setField = useCallback((path, value) => {
		setForm(prev => {
			const parts = String(path).split('.')
			const next =
				typeof structuredClone === 'function'
					? structuredClone(prev)
					: JSON.parse(JSON.stringify(prev))
			let cur = next
			for (let i = 0; i < parts.length - 1; i++) {
				const k = parts[i]
				if (typeof cur[k] !== 'object' || cur[k] == null) cur[k] = {}
				cur = cur[k]
			}
			cur[parts[parts.length - 1]] = value
			return next
		})
	}, [])

	const handleOpen = useCallback(() => setOpen(true), [])
	const handleClose = useCallback(() => {
		setFiltersOpen(false)
		setOpen(false)
	}, [])

	// «все» — как раньше: применяем и закрываем
	const pickAllAndClose = useCallback(() => {
		dispatch(clearApplied())
		dispatch(setCategorySmart('all'))
		try {
			window.scrollTo({ top: 0, behavior: 'smooth' })
		} catch {}
		handleClose()
		window.dispatchEvent(
			new CustomEvent('nav:category-picked', { detail: { category: 'all' } })
		)
	}, [dispatch, handleClose])

	// Клик по категории: для 'all' — применить, иначе просто раскрыть/свернуть аккордеон
	const onCategoryClick = useCallback(
		cat => {
			if (cat.key === 'all') {
				pickAllAndClose()
				return
			}
			setExpandedId(prev => (prev === cat.key ? null : cat.key))
			// Также отмечаем выбор категории в Redux (как на десктопе)
			dispatch(setCategorySmart(cat.key))
			try {
				window.dispatchEvent(
					new CustomEvent('nav:category-picked', {
						detail: { category: cat.key },
					})
				)
			} catch {}
		},
		[dispatch, pickAllAndClose]
	)

	// Клик по сабу — применяем, закрываем, уведомляем страницу (как на десктопе)
	const pickSubcategory = useCallback(
		subTitle => {
			const title = String(subTitle || '').trim()
			if (!title) return
			dispatch(clearApplied())
			dispatch(setCategorySmart(title))
			try {
				window.scrollTo({ top: 0, behavior: 'smooth' })
			} catch {}
			handleClose()
			window.dispatchEvent(
				new CustomEvent('nav:open-subcategory', { detail: { title } })
			)
		},
		[dispatch, handleClose]
	)

	// Лочим body-scroll при открытом меню
	useEffect(() => {
		if (!open) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [open])

	const onApplyFilters = useCallback(() => {
		dispatch(setFilters(form))
		setFiltersOpen(false)
		setOpen(false)
	}, [dispatch, form])

	const onResetFilters = useCallback(() => {
		dispatch(resetFilters())
	}, [dispatch])

	// === Рендер ===

	// Список категорий с АККОРДЕОНОМ (без стрелок), активная категория — красная
	const renderAccordion = () => (
		<div className='self-stretch p-3.5 bg-white rounded-[20px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)] flex flex-col gap-[2px]'>
			{categories.map(cat => {
				const isAll = cat.key === 'all'
				const subs = cat.subs || []
				const subKeys = subs.map(norm)
				const isActiveCat =
					selectedKey === cat.key || subKeys.includes(selectedKey)
				const isOpen = !isAll && expandedId === cat.key

				return (
					<div key={cat.key} className='w-full'>
						{/* Ряд категории */}
						<button
							type='button'
							onClick={() => onCategoryClick(cat)}
							aria-current={isActiveCat ? 'true' : 'false'}
							data-active={isActiveCat ? 'true' : 'false'}
							className='w-full h-7 rounded-[10px] inline-flex justify-start items-center gap-4'
						>
							{/* «плитки» у категорий оставляем как было в бургер-меню */}
							<div className='w-7 h-7 bg-white rounded-[5px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)]' />
							<div
								className={[
									'flex-1 text-left text-sm font-baron capitalize',
									isActiveCat
										? 'text-firework-red font-medium'
										: 'text-[#333] hover:text-firework-red',
								].join(' ')}
							>
								{cat.title}
							</div>
							{/* стрелок нет */}
						</button>

						{/* Блок подкатегорий (как на десктопе — аккордеон) */}
						<AnimatePresence initial={false}>
							{isOpen && !!subs.length && (
								<motion.ul
									key={`${cat.key}-subs`}
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: 'auto', opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.18, ease: 'easeOut' }}
									className='pl-9 mt-1 space-y-1 overflow-hidden'
								>
									{subs.map(sub => {
										const subKey = norm(sub)
										const isActiveSub = selectedKey === subKey
										return (
											<li key={sub}>
												<button
													type='button'
													onClick={() => pickSubcategory(sub)}
													aria-current={isActiveSub ? 'true' : 'false'}
													data-active={isActiveSub ? 'true' : 'false'}
													className={[
														'w-[190px] h-[30px] font-baron lowercase text-left rounded-[8px] text-[12px] px-2',
														isActiveSub
															? 'bg-violet-400/50 text-[#997DF5] font-medium'
															: 'text-gray-700 hover:text-firework-red',
													].join(' ')}
												>
													{sub}
												</button>
											</li>
										)
									})}
								</motion.ul>
							)}
						</AnimatePresence>
					</div>
				)
			})}
		</div>
	)

	return (
		<>
			{/* Кнопка в шапке */}
			<button
				type='button'
				aria-label='Открыть меню'
				onClick={handleOpen}
				className='inline-flex items-center justify-center'
			>
				<BurgerSvg />
			</button>

			{/* Портал */}
			{createPortal(
				<AnimatePresence>
					{open && (
						<>
							{/* Бэкдроп */}
							<motion.div
								key='backdrop'
								className='fixed inset-0 bg-black/30'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								style={{ zIndex: 1200 }}
								onClick={handleClose}
							/>

							{/* Сайдбар */}
							<motion.aside
								key='drawer'
								className={[
									'fixed top-0 left-0 h-full w-96',
									'bg-[#EFEBE6] px-2 pt-1',
									'shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)]',
									'overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
									'subpixel-antialiased',
								].join(' ')}
								variants={drawerVariants}
								initial='closed'
								animate='open'
								exit='closed'
								style={{
									zIndex: 1201,
									WebkitFontSmoothing: 'auto',
									backfaceVisibility: 'hidden',
								}}
							>
								{/* Закрыть */}
								<button
									type='button'
									aria-label='Закрыть меню'
									onClick={handleClose}
								>
									<BurgerCloseSvg />
								</button>

								<div className='max-w-[335px] px-2.5 mt-1 space-y-2.5'>
									{/* Категории с аккордеоном (как десктоп) */}
									{renderAccordion()}

									{/* Фильтры (аккордеон) */}
									<div className='self-stretch px-2.5 py-3.5 bg-white rounded-[20px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)]'>
										<button
											type='button'
											onClick={() => setFiltersOpen(v => !v)}
											className='w-full px-3.5 flex items-center justify-between'
										>
											<div className='text-[#625a51] text-lg font-baron lowercase'>
												фильтры
											</div>
											<div
												className={[
													'w-4 h-4 transition-transform duration-200',
													filtersOpen ? 'rotate-90' : 'rotate-0',
												].join(' ')}
											>
												<svg
													width='16'
													height='16'
													viewBox='0 0 16 16'
													fill='none'
													xmlns='http://www.w3.org/2000/svg'
												>
													<path
														d='M5.293 14.364a.999.999 0 010-1.414L10.243 8 5.293 3.05A.999.999 0 016.707 1.636l5.657 5.657a1 1 0 010 1.414L6.707 14.364a.999.999 0 01-1.414 0z'
														fill='black'
													/>
												</svg>
											</div>
										</button>

										<AnimatePresence initial={false}>
											{filtersOpen && (
												<motion.div
													key='filters-body'
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: 'auto', opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.22, ease: 'easeOut' }}
													className='pt-3 px-3 overflow-hidden relative z-10'
												>
													<SubcategoryOverlay
														variant='mobile'
														embed
														isOpen={filtersOpen}
														form={form}
														setField={setField}
														resultsCount={resultsCount}
														onApply={onApplyFilters}
														onReset={onResetFilters}
													/>
												</motion.div>
											)}
										</AnimatePresence>
									</div>

									{/* Футер */}
									<div className='self-stretch p-2.5 space-y-5'>
										<div className='flex flex-col gap-2.5'>
											<div className='text-[#625a51] text-sm font-baron lowercase cursor-pointer'>
												<Link to='/contacts'>контакты</Link>
											</div>
											<div className='text-[#625a51] text-sm font-baron lowercase'>
												<Link to='/wholesale'>оптовикам</Link>
											</div>
										</div>
										<div className='flex flex-col gap-2.5'>
											<div className='text-[#625a51] text-sm font-baron lowercase'>
												ИП Федяков Иван Владимирович
											</div>
											<div className='text-[#625a51] text-sm font-baron lowercase'>
												сертификат профессионального пиротехника
											</div>
										</div>
									</div>

									<div className='w-5 h-5 bg-[#EFEBE6]' />
								</div>
							</motion.aside>
						</>
					)}
				</AnimatePresence>,
				document.body
			)}
		</>
	)
}

export default memo(BurgerMobile)
