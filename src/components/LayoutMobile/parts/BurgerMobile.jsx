// src/components/LayoutMobile/parts/BurgerMobile.jsx
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { setCategory } from '../../../store/slices/categoriesSlice'
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

function useCategories() {
	const items = useSelector(s => s.products.items || [])
	return useMemo(() => {
		const set = new Set()
		items.forEach(p => p?.category && set.add(norm(p.category)))
		const arr = Array.from(set)
		return ['all', ...arr.filter(c => c !== 'all')]
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

	const categories = useCategories()
	const resultsCount = useSelector(selectFilteredProducts).length
	const storeFilters = useSelector(selectFilters)

	const [form, setForm] = useState(() => mapStoreToForm(storeFilters))
	useEffect(() => {
		setForm(mapStoreToForm(storeFilters))
	}, [storeFilters])

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

	const pickCategory = useCallback(
		c => {
			dispatch(setCategory(c === 'all' ? 'all' : c))
			handleClose()
		},
		[dispatch, handleClose]
	)

	// Лочим скролл body при открытом меню
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
		setOpen(false) // закрываем меню, чтобы сразу увидеть список
	}, [dispatch, form])

	const onResetFilters = useCallback(() => {
		dispatch(resetFilters())
	}, [dispatch])

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

			{/* Портал поверх всего */}
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
									'bg-[#EFEBE6] px-2 pt-11',
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
									{/* Категории */}
									<div className='self-stretch p-3.5 bg-white rounded-[20px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)] flex flex-col gap-[5px]'>
										{categories.map(cat => (
											<button
												key={cat}
												type='button'
												onClick={() => pickCategory(cat)}
												className='self-stretch h-7 rounded-[10px] inline-flex justify-start items-center gap-4'
											>
												<div className='w-7 h-7 bg-white rounded-[5px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)]' />
												<div className='flex-1 text-black text-left text-sm font-baron capitalize'>
													{cat === 'all' ? 'все' : cat}
												</div>
											</button>
										))}
									</div>

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
													filtersOpen ? 'rotate-90' : 'rotate-0', // открыто: вниз, закрыто: вверх
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
														d='M5.29303 14.364C5.10556 14.1765 5.00024 13.9222 5.00024 13.657C5.00024 13.3918 5.10556 13.1375 5.29303 12.95L10.243 8.00001L5.29303 3.05001C5.11087 2.86141 5.01008 2.60881 5.01236 2.34661C5.01463 2.08442 5.1198 1.8336 5.30521 1.64819C5.49062 1.46279 5.74143 1.35762 6.00363 1.35534C6.26583 1.35306 6.51843 1.45386 6.70703 1.63601L12.364 7.29301C12.5515 7.48054 12.6568 7.73485 12.6568 8.00001C12.6568 8.26518 12.5515 8.51949 12.364 8.70701L6.70703 14.364C6.5195 14.5515 6.2652 14.6568 6.00003 14.6568C5.73487 14.6568 5.48056 14.5515 5.29303 14.364Z'
														fill='black'
													/>
												</svg>
											</div>
										</button>

										{/* Анимация высоты + обрезка краёв */}
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

									{/* Футер внутри панели */}
									<div className='self-stretch p-2.5 space-y-5'>
										<div className='flex flex-col gap-2.5'>
											<div className='text-[#625a51] text-sm font-baron lowercase cursor-pointer'>
												контакты
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
