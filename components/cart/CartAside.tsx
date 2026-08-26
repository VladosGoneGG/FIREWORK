import CartBody from './CartBody'

// Desktop (>=1041px): the original's cart is a permanently docked column,
// not a click-to-open overlay — no open/close state, no dialog semantics,
// same treatment as the category rail next to it. Fixed 834px height
// (App.jsx's COLUMN_HEIGHT constant) — NOT viewport-relative: unlike the
// catalogue card (which the original's useStickToBottom hook stretches to
// fill the viewport), the sidebar/cart columns are always exactly 834px,
// so on a tall viewport they end up visibly shorter than the card sitting
// beside them — that's the original's actual behavior, not a bug to
// "fix" by matching heights. Rendered from the root layout at 1041px+;
// CartSheet is the mobile equivalent.
export default function CartAside() {
	return (
		<aside className="font-baron hidden w-[295px] shrink-0 flex-col self-start rounded-[20px] bg-white shadow-[0_0_15px_rgba(0,0,0,0.15)] min-[1041px]:sticky min-[1041px]:top-5 min-[1041px]:flex min-[1041px]:max-h-[834px]">
			<div className="border-b border-[#efebe6] px-4 py-3">
				<h2 className="text-base font-semibold text-[#333]">корзина</h2>
			</div>
			<CartBody />
		</aside>
	)
}
