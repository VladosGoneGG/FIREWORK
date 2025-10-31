// src/components/CategoryFilter/CategoryFilter.jsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	fetchCategories,
	setCategorySmart, // умный сет: нормализует "все"/категорию/подкатегорию
} from '../../store/slices/categoriesSlice'
import { clearSearchQuery } from '../../store/slices/productsSlice'
import CategoryRow from '../CategoryRow/CategoryRow'
import SubcategoryRow from '../SubcategoryRow/SubcategoryRow'
import CategoryFilterSkeleton from './CategoryFilterSkeleton'

const norm = name =>
	name === 'Все'
		? 'all'
		: String(name || '')
				.trim()
				.toLowerCase()
				.replaceAll('ё', 'е')

const CategoryFilter = ({ onAnyCategoryClick }) => {
	const dispatch = useDispatch()
	const { list, selectedCategory, selectedSub, status } = useSelector(
		s => s.categories
	)

	const [expandedId, setExpandedId] = useState(null)

	// загрузка категорий
	useEffect(() => {
		if (status === 'idle') dispatch(fetchCategories())
	}, [status, dispatch])

	// быстрые справочники
	const hasSubsById = useMemo(() => {
		const m = new Map()
		for (const c of list) m.set(c.id, (c.subcategories?.length || 0) > 0)
		return m
	}, [list])

	// карта: subKey -> parentCatId
	const subKeyToParentId = useMemo(() => {
		const map = new Map()
		for (const c of list) {
			const subs = c.subcategories || []
			for (const s of subs) {
				map.set(norm(s.name), c.id)
			}
		}
		return map
	}, [list])

	// авто-раскрытие категории, если выбран её саб
	useEffect(() => {
		const selSub = norm(selectedSub || '')
		const selCat = norm(selectedCategory || 'all')

		if (selSub) {
			const parentId = subKeyToParentId.get(selSub)
			if (parentId) {
				setExpandedId(parentId)
				return
			}
		}

		// если саб не выбран — сворачиваем при "all", иначе не трогаем (пусть руками открывают)
		if (selCat === 'all') setExpandedId(null)
	}, [selectedSub, selectedCategory, subKeyToParentId])

	const handleCategoryClick = useCallback(
		cat => {
			onAnyCategoryClick?.()
			const key = norm(cat.name)

			dispatch(setCategorySmart(key))
			dispatch(clearSearchQuery())

			// синхронизируем с контентом (страница/мобильная)
			try {
				window.dispatchEvent(
					new CustomEvent('nav:category-picked', { detail: { category: key } })
				)
			} catch {}

			if (hasSubsById.get(cat.id) && key !== 'all') {
				setExpandedId(prev => (prev === cat.id ? null : cat.id))
			} else {
				setExpandedId(null)
			}
		},
		[dispatch, hasSubsById, onAnyCategoryClick]
	)

	const handleSubClick = useCallback(
		name => {
			onAnyCategoryClick?.()
			const subKey = norm(name)

			// 1) открыть подкатегорию на странице (десктоп/мобила слушают это событие)
			try {
				window.dispatchEvent(
					new CustomEvent('nav:open-subcategory', { detail: { title: name } })
				)
			} catch {}

			// 2) зафиксировать выбор в сторе (установит selectedCategory и selectedSub)
			dispatch(setCategorySmart(subKey))
			dispatch(clearSearchQuery())
		},
		[dispatch, onAnyCategoryClick]
	)

	if (status === 'loading') return <CategoryFilterSkeleton />

	if (!list?.length) {
		return (
			<aside className='w-[240px] bg-white rounded-[20px] p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.2)]' />
		)
	}

	const selCatKey = norm(selectedCategory || 'all')
	const selSubKey = norm(selectedSub || '')

	return (
		<aside className='w-[240px] h-auto bg-white rounded-[20px] p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.2)] font-baron lowercase font-bold'>
			<ul className='space-y-1'>
				{list.map((cat, idx) => {
					const key = norm(cat.name)
					const subs = cat.subcategories || []
					const subKeys = subs.map(s => norm(s.name))

					// активна, если выбрана сама категория ИЛИ любая её подкатегория
					const isActiveCat = selCatKey === key || subKeys.includes(selSubKey)

					const isOpen = expandedId === cat.id && hasSubsById.get(cat.id)

					return (
						<li key={cat.id}>
							<CategoryRow
								cat={cat}
								active={isActiveCat}
								onClick={() => handleCategoryClick(cat)}
								idx={idx} // <-- индекс для выбора иконки по порядку
							/>

							{isOpen && (
								<ul className='pl-9 mt-1 space-y-1'>
									{subs.map(sub => {
										const subKey = norm(sub.name)
										const isActiveSub = selSubKey === subKey
										return (
											<SubcategoryRow
												key={sub.id}
												sub={sub}
												active={isActiveSub}
												onClick={() => handleSubClick(sub.name)}
											/>
										)
									})}
								</ul>
							)}
						</li>
					)
				})}
			</ul>
		</aside>
	)
}

export default CategoryFilter
