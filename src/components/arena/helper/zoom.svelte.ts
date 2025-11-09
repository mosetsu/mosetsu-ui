import { useSvelteFlow } from '@xyflow/svelte';

export class ZoomControl {
	zoomLevel = $state(90);
	private flowApi: ReturnType<typeof useSvelteFlow> | null = null;

	init(flowApi: ReturnType<typeof useSvelteFlow>) {
		this.flowApi = flowApi;
		this.startTracking();
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

	zoomIn = () => {
		this.flowApi?.zoomIn();
	};

	zoomOut = () => {
		this.flowApi?.zoomOut();
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
