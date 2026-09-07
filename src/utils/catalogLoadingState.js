// Разделяет "загрузка первой страницы" и "догрузка следующей" — раньше оба
// случая делили один флаг status==='loading', из-за чего ProductSection
// заменял УЖЕ отрисованные карточки скелетонами при каждой подгрузке
// следующей страницы infinite-scroll. Полноэкранный скелетон нужен только
// когда для текущего запроса (категория/поиск/фильтры) ещё вообще нет
// товаров; если хотя бы один раздел непуст — показываем небольшой
// индикатор "загрузка…" рядом со sentinel, а карточки остаются на месте.
export function getCatalogLoadingState(status, sections) {
	const hasAnyItems = (sections || []).some(sec => (sec?.items?.length || 0) > 0)
	const isLoading = status === 'loading'

	return {
		showInitialSkeleton: isLoading && !hasAnyItems,
		showLoadingMore: isLoading && hasAnyItems,
	}
}
