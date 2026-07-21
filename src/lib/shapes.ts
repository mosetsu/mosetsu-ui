import { Position } from '@xyflow/svelte';
import type { HandleDef } from '$lib/modules';

/**
 * "Blank" shapes — geometry-only nodes (no metrics / congestion) used to
 * annotate a design: decisions, processes, terminators, notes, etc. You type
 * a label in the middle and wire them up like any other node.
 *
 * These live in a separate registry from MODULES because they carry no
 * throughput / cost semantics; they render through ShapeNode instead of
 * BlockNode. Types are `shape-*` so they never collide with module keys.
 */

export type ShapeKind =
	| 'rectangle'
	| 'rounded'
	| 'diamond'
	| 'ellipse'
	| 'circle'
	| 'parallelogram';

export type ShapeDef = {
	type: string;
	/** Menu name + default label dropped into the shape. */
	label: string;
	kind: ShapeKind;
	/** hex — drives outline / fill tint, same convention as ModuleDef.accent */
	accent: string;
	handles: HandleDef[];
};

// Flexible 4-way ports: target in (left/top), source out (right/bottom).
const FLOW: HandleDef[] = [
	{ type: 'target', position: Position.Left, id: 'left' },
	{ type: 'target', position: Position.Top, id: 'top' },
	{ type: 'source', position: Position.Right, id: 'right' },
	{ type: 'source', position: Position.Bottom, id: 'bottom' }
];

const shape = (type: string, label: string, kind: ShapeKind, accent: string): ShapeDef => ({
	type,
	label,
	kind,
	accent,
	handles: FLOW
});

export const SHAPES: Record<string, ShapeDef> = {
	'shape-rectangle': shape('shape-rectangle', 'Process', 'rectangle', '#4a9eff'),
	'shape-rounded': shape('shape-rounded', 'Start / End', 'rounded', '#4ac97e'),
	'shape-diamond': shape('shape-diamond', 'Decision', 'diamond', '#f0a93b'),
	'shape-ellipse': shape('shape-ellipse', 'State', 'ellipse', '#8b7cf6'),
	'shape-parallelogram': shape('shape-parallelogram', 'Input / Output', 'parallelogram', '#33b7c4'),
	'shape-circle': shape('shape-circle', 'Connector', 'circle', '#e0563b')
};

export const isShape = (type: string): boolean => type in SHAPES;
export const getShape = (type: string): ShapeDef | undefined => SHAPES[type];

/** Ordered list for the blanks dock. */
export const SHAPE_LIST: ShapeDef[] = Object.values(SHAPES);
