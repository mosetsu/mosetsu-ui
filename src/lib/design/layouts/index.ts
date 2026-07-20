import { layeredLayout } from '$lib/design/layouts/layered';

/**
 * Layout registry. Add a new layout by adding an entry here (label, icon path,
 * the edge-handle direction it implies, and a position function). Everything —
 * the upload switch, the footer toggle, and re-layout of the live graph —
 * reads from this registry.
 */

export type LayoutId = 'vertical' | 'horizontal';

export type LayoutDef = {
	id: LayoutId;
	label: string;
	/** SVG `d` (24×24, stroke=currentColor) rendered inline in the UI. */
	iconPath: string;
	/** Default edge handles this orientation implies. */
	sourceHandle: string;
	targetHandle: string;
	layout: (
		nodes: { id?: string }[],
		edges: { source: string; target: string }[]
	) => Map<string, { x: number; y: number }>;
};

export const LAYOUTS: Record<LayoutId, LayoutDef> = {
	vertical: {
		id: 'vertical',
		label: 'Vertical',
		iconPath: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm0 6h16',
		sourceHandle: 'bottom',
		targetHandle: 'top',
		layout: (n, e) => layeredLayout(n, e, 'vertical')
	},
	horizontal: {
		id: 'horizontal',
		label: 'Horizontal',
		iconPath: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm8-2v16',
		sourceHandle: 'right',
		targetHandle: 'left',
		layout: (n, e) => layeredLayout(n, e, 'horizontal')
	}
};

export const LAYOUT_LIST: LayoutDef[] = Object.values(LAYOUTS);
export const DEFAULT_LAYOUT: LayoutId = 'vertical';
export const getLayout = (id: string): LayoutDef =>
	LAYOUTS[id as LayoutId] ?? LAYOUTS[DEFAULT_LAYOUT];
