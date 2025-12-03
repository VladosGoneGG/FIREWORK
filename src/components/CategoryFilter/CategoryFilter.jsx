// src/components/CategoryFilter/CategoryFilter.jsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	fetchCategories,
	setCategorySmart,
} from '../../store/slices/categoriesSlice'
import { clearSearchQuery } from '../../store/slices/productsSlice'
import CategoryRow from '../CategoryRow/CategoryRow'
import SubcategoryRow from '../SubcategoryRow/SubcategoryRow'
import CategoryFilterSkeleton from './CategoryFilterSkeleton'
import { normalizeCategoryName, normalizeString } from '../../utils/normalize'
import { useNavigate } from 'react-router-dom'

const CategoryFilter = ({ onAnyCategoryClick }) => {
	const dispatch = useDispatch()
	const navigate = useNavigate() // ⬅️ добавили

	const { list, selectedCategory, selectedSub, status } = useSelector(
		s => s.categories
	)

	const [expandedId, setExpandedId] = useState(null)

	useEffect(() => {
		if (status === 'idle') dispatch(fetchCategories())
	}, [status, dispatch])

	const hasSubsById = useMemo(() => {
		const m = new Map()
		for (const c of list) m.set(c.id, (c.subcategories?.length || 0) > 0)
		return m
	}, [list])

	const subKeyToParentId = useMemo(() => {
		const map = new Map()
		for (const c of list) {
			const subs = c.subcategories || []
			for (const s of subs) map.set(normalizeCategoryName(s.name), c.id)
		}
		return map
	}, [list])

	useEffect(() => {
		const selSub = normalizeCategoryName(selectedSub || '')
		const selCat = normalizeCategoryName(selectedCategory || 'all')

		if (selSub) {
			const parentId = subKeyToParentId.get(selSub)
			if (parentId) {
				setExpandedId(parentId)
				return
			}
		}
		if (selCat === 'all') setExpandedId(null)
	}, [selectedSub, selectedCategory, subKeyToParentId])

	const backToRoot = () => {
		// возвращаемся на '/', чтобы центр перестал рендерить /contacts|/wholesale
		navigate('/', { replace: true })
	}

	const handleCategoryClick = useCallback(
		cat => {
			onAnyCategoryClick?.()
			const key = normalizeCategoryName(cat.name)

			dispatch(setCategorySmart(key))
			dispatch(clearSearchQuery())

			// ⬇️ КРИТИЧЕСКОЕ: сбросить маршрут на главный
			backToRoot()

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
		[dispatch, hasSubsById, onAnyCategoryClick] // navigate/backToRoot замыкать не нужно
	)

	const handleSubClick = useCallback(
		name => {
			onAnyCategoryClick?.()
			const subKey = normalizeCategoryName(name)

			try {
				window.dispatchEvent(
					new CustomEvent('nav:open-subcategory', { detail: { title: name } })
				)
			} catch {}

			dispatch(setCategorySmart(subKey))
			dispatch(clearSearchQuery())

			// ⬇️ Аналогично при выборе подкатегории
			backToRoot()
		},
		[dispatch, onAnyCategoryClick]
	)

	if (status === 'loading') return <CategoryFilterSkeleton />

	if (!list?.length) {
		return (
			<aside className='w-[240px] bg-white rounded-[20px] p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.2)]' />
		)
	}

	const selCatKey = normalizeCategoryName(selectedCategory || 'all')
	const selSubKey = normalizeCategoryName(selectedSub || '')

	return (
		<aside className='w-[240px] h-auto bg-white rounded-[20px] p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.2)] font-baron lowercase font-bold'>
			<ul className='space-y-1'>
				{list.map((cat, idx) => {
					const key = normalizeCategoryName(cat.name)
					const subs = cat.subcategories || []
					const subKeys = subs.map(s => normalizeCategoryName(s.name))
					const isActiveCat = selCatKey === key || subKeys.includes(selSubKey)
					const isOpen = expandedId === cat.id && hasSubsById.get(cat.id)

					return (
						<li key={cat.id}>
							<CategoryRow
								cat={cat}
								active={isActiveCat}
								onClick={() => handleCategoryClick(cat)}
								idx={idx}
							/>
							{isOpen && (
								<ul className='pl-9 mt-1 space-y-1'>
									{subs.map(sub => {
										const subKey = normalizeCategoryName(sub.name)
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
