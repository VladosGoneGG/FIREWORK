import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	fetchCategories,
	setCategory,
} from '../../store/slices/categoriesSlice'
import { clearSearchQuery } from '../../store/slices/productsSlice'
import CategoryRow from '../CategoryRow/CategoryRow'
import SubcategoryRow from '../SubcategoryRow/SubcategoryRow'
import CategoryFilterSkeleton from './CategoryFilterSkeleton'

const norm = name => (name === 'Все' ? 'all' : String(name || '').toLowerCase())

const CategoryFilter = () => {
	const dispatch = useDispatch()
	const { list, selectedCategory, status } = useSelector(s => s.categories)
	const [expandedId, setExpandedId] = useState(null)

	useEffect(() => {
		if (status === 'idle') dispatch(fetchCategories())
	}, [status, dispatch])

	const hasSubsById = useMemo(() => {
		const m = new Map()
		for (const c of list) m.set(c.id, (c.subcategories?.length || 0) > 0)
		return m
	}, [list])

	const handleCategoryClick = useCallback(
		cat => {
			const key = norm(cat.name)
			dispatch(setCategory(key))
			dispatch(clearSearchQuery())
			if (hasSubsById.get(cat.id) && key !== 'all') {
				setExpandedId(prev => (prev === cat.id ? null : cat.id))
			} else {
				setExpandedId(null)
			}
		},
		[dispatch, hasSubsById]
	)

	const handleSubClick = useCallback(
		name => {
			dispatch(setCategory(norm(name)))
			dispatch(clearSearchQuery())
		},
		[dispatch]
	)

	// ← показываем скелетон при загрузке
	if (status === 'loading') {
		return <CategoryFilterSkeleton />
	}

	// никаких “ошибок/нет данных” — по просьбе просто пустая колонка
	if (!list?.length) {
		return (
			<aside className='w-[240px] bg-white rounded-[20px] p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.2)]' />
		)
	}

	return (
		<aside className='w-[240px] bg-white rounded-[20px] p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.2)] font-baron lowercase font-bold '>
			<ul className='space-y-1'>
				{list.map(cat => {
					const key = norm(cat.name)
					const isActiveCat = (selectedCategory || 'all') === key
					const isOpen = expandedId === cat.id && hasSubsById.get(cat.id)

					return (
						<li key={cat.id}>
							<CategoryRow
								cat={cat}
								active={isActiveCat}
								onClick={() => handleCategoryClick(cat)}
							/>

							{isOpen && (
								<ul className='pl-9 mt-1 space-y-1'>
									{cat.subcategories.map(sub => {
										const subKey = norm(sub.name)
										const isActiveSub = (selectedCategory || '') === subKey
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
