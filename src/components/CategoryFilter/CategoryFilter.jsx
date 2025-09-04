import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import minBlock from '../../assets/SVG/min-block.svg'
import {
	fetchCategories,
	setCategory,
} from '../../store/slices/categoriesSlice'
import PressableButton from '../PressableButton/PressableButton'

const CategoryFilter = () => {
	const dispatch = useDispatch()
	const { list, selectedCategory, status } = useSelector(s => s.categories)
	const [expandedId, setExpandedId] = useState(null)

	useEffect(() => {
		if (status === 'idle') dispatch(fetchCategories())
	}, [status, dispatch])

	const hasSubs = useMemo(() => {
		const m = new Map()
		for (const c of list) m.set(c.id, (c.subcategories?.length || 0) > 0)
		return m
	}, [list])

	const norm = name => (name === 'Все' ? 'all' : name.toLowerCase())

	const onCategoryClick = cat => {
		const key = norm(cat.name)
		dispatch(setCategory(key))
		// аккордеон только если есть подкатегории
		if (hasSubs.get(cat.id) && key !== 'all') {
			setExpandedId(prev => (prev === cat.id ? null : cat.id))
		} else {
			setExpandedId(null) // «Все» и плоские категории — закрыть всё
		}
	}

	const onSubClick = name => {
		dispatch(setCategory(name.toLowerCase()))
	}

	if (status === 'loading')
		return <aside className='w-[240px]'>Загрузка категорий...</aside>

	return (
		<aside className='w-[240px] bg-white rounded-[20px] p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.2)] font-baron'>
			<ul className='space-y-1'>
				{list.map(cat => {
					const key = norm(cat.name)
					const isActiveCat = (selectedCategory || 'all') === key
					const isOpen = expandedId === cat.id && hasSubs.get(cat.id)

					return (
						<li key={cat.id}>
							<PressableButton
								className={`flex items-center gap-4 my-[5px] w-[220px] h-[30px] text-[12px] rounded-[12px] text-left
                  ${
										isActiveCat
											? 'text-firework-red font-medium'
											: 'text-[#333] hover:text-firework-red'
									}`}
								onClick={() => onCategoryClick(cat)}
								aria-expanded={isOpen}
							>
								<img
									src={minBlock}
									alt=''
									className={`w-[30px] h-[30px] ${
										isActiveCat ? 'opacity-100' : 'opacity-80'
									}`}
								/>
								<span className='truncate'>{cat.name}</span>
							</PressableButton>

							{isOpen && (
								<ul className='pl-9 mt-1 space-y-1'>
									{cat.subcategories.map(sub => {
										const subKey = sub.name.toLowerCase()
										const isActiveSub = (selectedCategory || '') === subKey
										return (
											<li key={sub.id}>
												<PressableButton
													className={`w-[190px] h-[30px] text-left rounded-[8px] text-[12px]
                            ${
															isActiveSub
																? 'text-[#997DF5] font-medium'
																: 'text-gray-700 hover:text-firework-red'
														}`}
													onClick={() => onSubClick(sub.name)}
													aria-current={isActiveSub ? 'true' : 'false'}
												>
													{sub.name}
												</PressableButton>
											</li>
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
