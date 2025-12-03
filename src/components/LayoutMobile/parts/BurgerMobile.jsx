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

import CategoryRow from '../../CategoryRow/CategoryRow'
import SubcategoryRow from '../../SubcategoryRow/SubcategoryRow'

const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()
		.replaceAll('ё', 'е')

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

	const {
		list: categoriesList,
		selectedCategory,
		selectedSub,
	} = useSelector(s => s.categories)

	const [expandedId, setExpandedId] = useState(null)

	const hasSubsById = useMemo(() => {
		const m = new Map()
		for (const c of categoriesList)
			m.set(c.id, (c.subcategories?.length || 0) > 0)
		return m
	}, [categoriesList])

	useEffect(() => {
		const selSub = norm(selectedSub || '')
		const selCat = norm(selectedCategory || 'all')

		if (selSub) {
			for (const c of categoriesList) {
				if ((c.subcategories || []).some(s => norm(s.name) === selSub)) {
					setExpandedId(c.id)
					return
				}
			}
		}
		if (selCat === 'all') setExpandedId(null)
	}, [selectedSub, selectedCategory, categoriesList])

	const resultsCount = useSelector(selectFilteredProducts).length
	const storeFilters = useSelector(selectFilters)
	const [form, setForm] = useState(storeFilters)
	useEffect(() => setForm(storeFilters), [storeFilters])

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
		try {
			document.body.style.overflow = ''
		} catch {}
	}, [])

	const closeAndNotify = useCallback(
		(evtName, detail) => {
			try {
				window.scrollTo({ top: 0, behavior: 'smooth' })
			} catch {}
			handleClose()
			requestAnimationFrame(() => {
				try {
					window.dispatchEvent(new CustomEvent(evtName, { detail }))
				} catch {}
			})
		},
		[handleClose]
	)

	const pickAllAndClose = useCallback(() => {
		dispatch(clearApplied())
		dispatch(setCategorySmart('all'))
		closeAndNotify('nav:category-picked', { category: 'all' })
	}, [dispatch, closeAndNotify])

	const onCategoryClick = useCallback(
		cat => {
			const key = norm(cat.name) || 'all'
			const hasSubs = hasSubsById.get(cat.id)

			dispatch(clearApplied())
			dispatch(setCategorySmart(key))

			requestAnimationFrame(() => {
				try {
					window.dispatchEvent(
						new CustomEvent('nav:category-picked', {
							detail: { category: key },
						})
					)
				} catch {}
			})

			if (key === 'all') {
				handleClose()
				return
			}

			if (hasSubs) {
				setExpandedId(prev => (prev === cat.id ? null : cat.id))
			} else {
				closeAndNotify('nav:category-picked', { category: key })
			}
		},
		[dispatch, hasSubsById, closeAndNotify, handleClose]
	)

	const pickSubcategory = useCallback(
		subTitle => {
			const title = String(subTitle || '').trim()
			if (!title) return
			dispatch(clearApplied())
			dispatch(setCategorySmart(title))
			closeAndNotify('nav:open-subcategory', { title })
		},
		[dispatch, closeAndNotify]
	)

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

	const renderAccordionDesktopLike = () => {
		const selCatKey = norm(selectedCategory || 'all')
		const selSubKey = norm(selectedSub || '')

		return (
			<div className='self-stretch p-3.5 bg-white rounded-[20px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)] flex flex-col gap-[2px]'>
				<ul className='space-y-1'>
					{categoriesList.map((cat, idx) => {
						const subs = cat.subcategories || []
						const subKeys = subs.map(s => norm(s.name))
						const isActiveCat =
							selCatKey === norm(cat.name) || subKeys.includes(selSubKey)
						const isOpen = expandedId === cat.id && hasSubsById.get(cat.id)

						return (
							<li className='font-baron ' key={cat.id}>
								<CategoryRow
									cat={cat}
									active={isActiveCat}
									onClick={() => onCategoryClick(cat)}
									idx={idx}
								/>

								<AnimatePresence initial={false}>
									{isOpen && !!subs.length && (
										<motion.ul
											key={`${cat.id}-subs`}
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: 'auto', opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.18, ease: 'easeOut' }}
											className='pl-9 mt-1 space-y-1 overflow-hidden'
										>
											{subs.map(sub => {
												const subKey = norm(sub.name)
												const isActiveSub = selSubKey === subKey
												return (
													<SubcategoryRow
														key={sub.id}
														sub={sub}
														active={isActiveSub}
														onClick={() => pickSubcategory(sub.name)}
													/>
												)
											})}
										</motion.ul>
									)}
								</AnimatePresence>
							</li>
						)
					})}
				</ul>
			</div>
		)
	}

	return (
		<>
			<button
				type='button'
				aria-label='Открыть меню'
				onClick={handleOpen}
				className='inline-flex items-center justify-center'
			>
				<BurgerSvg />
			</button>

			{createPortal(
				<AnimatePresence>
					{open && (
						<>
							<motion.div
								key='backdrop'
								className='fixed inset-0 bg-black/30'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								style={{ zIndex: 1200 }}
								onClick={handleClose}
							/>

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
								<button
									type='button'
									aria-label='Закрыть меню'
									onClick={handleClose}
								>
									<BurgerCloseSvg />
								</button>

								<div className='max-w-[335px] px-2.5 mt-1 space-y-2.5'>
									{renderAccordionDesktopLike()}

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

									<div className='self-stretch p-2.5 space-y-5'>
										<div className='flex flex-col gap-2.5'>
											<div className='text-[#625a51] text-sm font-baron lowercase cursor-pointer'>
												<Link to='/contacts' onClick={handleClose}>
													контакты
												</Link>
											</div>
											<div className='text-[#625a51] text-sm font-baron lowercase cursor-pointer'>
												<Link to='/wholesale' onClick={handleClose}>
													оптовикам
												</Link>
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
