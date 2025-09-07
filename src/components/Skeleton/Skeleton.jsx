const cx = (...c) => c.filter(Boolean).join(' ')

/** Прямоугольный блок-скелетон */
export const SkeletonBlock = ({ className = '' }) => (
	<div className={cx('skeleton', className)} aria-hidden />
)

/** Кружок-скелетон (для иконок/аватарок) */
export const SkeletonCircle = ({ size = 24, className = '' }) => (
	<div
		className={cx('skeleton rounded-full', className)}
		style={{ width: size, height: size }}
		aria-hidden
	/>
)
