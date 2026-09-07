import { useSelector } from 'react-redux'
import { selectCatalogFacets } from '../../../store/slices/productsSlice'

// Хлопки — фиксированный пресет-набор из UX, не данные каталога, поэтому
// не подвержены проблеме "видно только то, что уже подгружено" и остаются
// хардкодом (см. shotsMatch в utils/filters.js и catalog.service.js).
const SHOTS_PRESETS = [1, 2, 3, 4, 50, 100]

// Тип товара/производитель/мощность — каталожные метаданные по ВСЕМУ
// каталогу (см. fetchCatalogFacets/useProductsBoot), а не производные от
// state.products.items: иначе чекбоксы показывали бы только то, что уже
// попало в infinite-scroll на клиенте. Пока facets ещё не загрузились
// (idle/loading) или запрос упал (failed) — просто пустые списки, обычный
// просмотр каталога это никак не блокирует.
const useFilterOptions = () => {
	const facets = useSelector(selectCatalogFacets)

	return {
		PRODUCT_TYPES: facets.types,
		MANUFACTURERS: facets.manufacturers,
		POWERS: facets.power,
		SHOTS_PRESETS,
	}
}

export default useFilterOptions
