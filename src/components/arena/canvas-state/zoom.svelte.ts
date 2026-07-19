import { useSvelteFlow } from '@xyflow/svelte';
import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';

export const ZOOM_STEP = 0.2; // additive zoom factor per wheel notch / +- click
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;

const clamp = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export class ZoomControl {
	zoomLevel = $state(90);
	private flowApi: ReturnType<typeof useSvelteFlow> | null = null;
	private stopTracking: (() => void) | null = null;

	init(flowApi: ReturnType<typeof useSvelteFlow>) {
		this.flowApi = flowApi;
		this.stopTracking?.();
		this.stopTracking = this.startTracking();
	}

	private startTracking() {
		const interval = setInterval(() => {
			if (this.flowApi) {
				try {
					const viewport = this.flowApi.getViewport();
					this.zoomLevel = Math.round(viewport.zoom * 100);
				} catch {
					// ignore
				}
			}
		}, 100);

		return () => clearInterval(interval);
	}

	/** Zoom to an absolute level, keeping the centre of the canvas fixed. */
	private zoomTo(nextZoom: number, duration: number) {
		if (!this.flowApi) return;
		try {
			const vp = this.flowApi.getViewport();
			if (!vp.zoom) return;
			const el = drawState.getContainer();
			const cx = (el?.clientWidth ?? 0) / 2;
			const cy = (el?.clientHeight ?? 0) / 2;
			// Flow-space point currently under the canvas centre.
			const flowX = (cx - vp.x) / vp.zoom;
			const flowY = (cy - vp.y) / vp.zoom;
			const z = clamp(nextZoom);
			this.flowApi.setViewport({ x: cx - flowX * z, y: cy - flowY * z, zoom: z }, { duration });
		} catch {
			// ignore
		}
	}

	private currentZoom(): number {
		try {
			return this.flowApi?.getViewport().zoom ?? 0.9;
		} catch {
			return 0.9;
		}
	}

	/** Step the zoom by one fixed increment. */
	zoomIn = (duration = 150) => {
		this.zoomTo(this.currentZoom() + ZOOM_STEP, duration);
	};

	zoomOut = (duration = 150) => {
		this.zoomTo(this.currentZoom() - ZOOM_STEP, duration);
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
				this.flowApi?.setViewport({ x: 0, y: 0, zoom: 0.9 });
			} catch {
				// ignore
			}
		}, 100);
	};

	getZoomLevel = () => {
		return this.zoomLevel;
	};
}

// Create singleton instance
export const zoomControl = new ZoomControl();
