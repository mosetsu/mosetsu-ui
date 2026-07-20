import { useSvelteFlow } from '@xyflow/svelte';
import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';

export const ZOOM_STEP = 0.2; // additive zoom factor per wheel notch / +- click
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;

const DEFAULT_ZOOM = 0.9;

const clamp = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

type FlowApi = ReturnType<typeof useSvelteFlow>;

export class ZoomControl {
	zoomLevel = $state(Math.round(DEFAULT_ZOOM * 100));
	private flowApi: FlowApi | null = null;
	private stopTracking: (() => void) | null = null;

	/** Bind the flow api; returns a cleanup that unbinds and stops tracking. */
	init(flowApi: FlowApi) {
		this.flowApi = flowApi;
		this.stopTracking?.();
		const interval = setInterval(() => {
			this.zoomLevel = Math.round(this.viewport().zoom * 100);
		}, 100);
		this.stopTracking = () => clearInterval(interval);

		return () => {
			this.stopTracking?.();
			this.stopTracking = null;
			this.flowApi = null;
		};
	}

	private viewport() {
		try {
			return this.flowApi?.getViewport() ?? { x: 0, y: 0, zoom: DEFAULT_ZOOM };
		} catch {
			return { x: 0, y: 0, zoom: DEFAULT_ZOOM };
		}
	}

	/** Convert client (screen) coordinates to flow-space coordinates. */
	screenToFlow(point: { x: number; y: number }): { x: number; y: number } | null {
		try {
			return this.flowApi?.screenToFlowPosition(point) ?? null;
		} catch {
			return null;
		}
	}

	/** Zoom to an absolute level, keeping the centre of the canvas fixed. */
	private zoomTo(nextZoom: number, duration: number) {
		if (!this.flowApi) {
			return;
		}
		const vp = this.viewport();
		if (!vp.zoom) {
			return;
		}
		const el = drawState.container;
		const cx = (el?.clientWidth ?? 0) / 2;
		const cy = (el?.clientHeight ?? 0) / 2;
		// Flow-space point currently under the canvas centre.
		const flowX = (cx - vp.x) / vp.zoom;
		const flowY = (cy - vp.y) / vp.zoom;
		const z = clamp(nextZoom);
		try {
			this.flowApi.setViewport({ x: cx - flowX * z, y: cy - flowY * z, zoom: z }, { duration });
		} catch {
			// ignore
		}
	}

	zoomIn = (duration = 150) => {
		this.zoomTo(this.viewport().zoom + ZOOM_STEP, duration);
	};

	zoomOut = (duration = 150) => {
		this.zoomTo(this.viewport().zoom - ZOOM_STEP, duration);
	};

	/** Frame all nodes in view (used after restoring / loading a design). */
	fit = (delay = 120) => {
		setTimeout(() => {
			try {
				this.flowApi?.fitView({ padding: 0.25, duration: 400, maxZoom: 1 });
			} catch {
				// ignore
			}
		}, delay);
	};

	setInitialZoom = () => {
		setTimeout(() => {
			try {
				this.flowApi?.setViewport({ x: 0, y: 0, zoom: DEFAULT_ZOOM });
			} catch {
				// ignore
			}
		}, 100);
	};
}

export const zoomControl = new ZoomControl();
