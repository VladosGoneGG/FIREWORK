// src/components/ui/NoPhoto.jsx
// Единый стиль плейсхолдера "Нет фото" — переиспользуется везде,
// где у товара может отсутствовать изображение.
export default function NoPhoto({ className = '' }) {
	return (
		<span className={['font-baron text-xs opacity-60', className].join(' ')}>
			Нет фото
		</span>
	)
}
