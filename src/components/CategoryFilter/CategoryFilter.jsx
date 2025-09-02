import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import minBlock from '../../assets/SVG/min-block.svg'
import {
	fetchCategories,
	setCategory,
} from '../../store/slices/categoriesSlice'

const CategoryFilter = () => {
	const dispatch = useDispatch()
	const { list, selectedCategory, status } = useSelector(s => s.categories)
	const [expanded, setExpanded] = useState({}) // { [id]: boolean }

	useEffect(() => {
		if (status === 'idle') dispatch(fetchCategories())
	}, [status, dispatch])

	const toggle = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
	const selectName = name => dispatch(setCategory(name.toLowerCase()))

	if (status === 'loading') {
		return <aside className='w-[240px]'>Загрузка категорий...</aside>
	}

	return (
		<aside className='w-[240px] bg-white rounded-[20px] p-4 shadow'>
			<h3 className='font-semibold mb-3 text-lg'>Категории</h3>
			<ul className='space-y-1'>
				{list.map(cat => {
					const isOpen = expanded[cat.id]
					const isActive =
						(selectedCategory || 'all') ===
						(cat.name === 'Все' ? 'all' : cat.name.toLowerCase())

					return (
						<li key={cat.id}>
							<button
								className={`
                  flex items-center gap-2 w-full
                  px-3 py-2 rounded-[12px] text-left transition
                  hover:bg-[#efebe6]
                  ${
										isActive
											? 'bg-firework-red text-white font-medium'
											: 'text-[#333]'
									}
                `}
								onClick={() => {
									toggle(cat.id)
									selectName(cat.name)
								}}
							>
								<img src={minBlock} alt='' className='w-5 h-5 opacity-80' />
								<span>{cat.name}</span>
							</button>

							{cat.subcategories?.length > 0 && isOpen && (
								<ul className='pl-9 mt-1 space-y-1'>
									{cat.subcategories.map(sub => {
										const sname = sub.name.toLowerCase()
										const activeSub = (selectedCategory || '') === sname
										return (
											<li key={sub.id}>
												<button
													className={`
                            w-full text-left px-3 py-1.5 rounded-[8px] text-sm transition
                            hover:bg-[#efebe6]
                            ${
															activeSub
																? 'bg-firework-red text-white font-medium'
																: 'text-gray-700'
														}
                          `}
													onClick={() => selectName(sub.name)}
												>
													{sub.name}
												</button>
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
