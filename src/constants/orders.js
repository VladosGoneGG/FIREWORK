// =============================
// Константы для заказов
// =============================
export const MIN_ORDER_AMOUNT = 4800

// Минимальная сумма заказа действует только для доставки — самовывоз
// её не требует (см. задачу №7).
export const getMinOrderAmount = delivery =>
	delivery === 'delivery' ? MIN_ORDER_AMOUNT : 0

