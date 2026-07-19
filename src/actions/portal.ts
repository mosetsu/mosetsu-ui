/**
 * Move an element to <body> so `position: fixed` is relative to the viewport,
 * not a transformed/filtered ancestor (e.g. the glass footer) that would
 * otherwise become the containing block for fixed descendants.
 */
export function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			node.parentNode?.removeChild(node);
		}
	};
}
