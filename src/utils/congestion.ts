import type { Edge, Node } from '@xyflow/svelte';
import type { BlockMetrics } from '$stores/block';

export type CongestionStatus = 'green' | 'yellow' | 'red';

export type CongestionResult = {
	status: CongestionStatus;
	ratio: number;
	inboundTotal: number;
	capacity: number;
};

const getThroughputFromNodeData = (data: Record<string, unknown>): number => {
	const metrics = data?.metrics as BlockMetrics | undefined;
	if (!metrics) {
		return 0;
	}

	if ('requestsPerSec' in metrics) {
		return metrics.requestsPerSec;
	}
	if ('queriesPerSec' in metrics) {
		return metrics.queriesPerSec;
	}
	if ('messagesPerSec' in metrics) {
		return metrics.messagesPerSec;
	}

	return 0;
};

export const getInboundConnections = (nodeId: string, edges: Edge[]): string[] => {
	return edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source);
};

export const getOutboundConnections = (nodeId: string, edges: Edge[]): string[] => {
	return edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);
};

export const aggregateInboundMetrics = (nodeId: string, nodes: Node[], edges: Edge[]): number => {
	const sourceIds = getInboundConnections(nodeId, edges);
	const sourceNodes = nodes.filter((n) => sourceIds.includes(n.id));

	return sourceNodes.reduce((sum, node) => {
		const throughput = getThroughputFromNodeData(node.data as Record<string, unknown>);
		return sum + throughput;
	}, 0);
};

export const calculateCongestionRatio = (aggregatedInput: number, nodeCapacity: number): number => {
	if (nodeCapacity <= 0) {
		return 100;
	}

	return (aggregatedInput / nodeCapacity) * 100;
};

export const getCongestionStatus = (ratio: number): CongestionStatus => {
	if (ratio < 50) {
		return 'green';
	}
	if (ratio < 80) {
		return 'yellow';
	}

	return 'red';
};

export const calculateNodeCongestion = (
	nodeId: string,
	nodes: Node[],
	edges: Edge[]
): CongestionResult => {
	const targetNode = nodes.find((n) => n.id === nodeId);
	if (!targetNode) {
		return { status: 'green', ratio: 0, inboundTotal: 0, capacity: 0 };
	}

	const capacity = getThroughputFromNodeData(targetNode.data as Record<string, unknown>);
	const inboundTotal = aggregateInboundMetrics(nodeId, nodes, edges);
	const ratio = calculateCongestionRatio(inboundTotal, capacity);
	const status = getCongestionStatus(ratio);

	return { status, ratio, inboundTotal, capacity };
};

export const getEdgeCongestion = (
	sourceId: string,
	targetId: string,
	nodes: Node[],
	edges: Edge[]
): CongestionResult => {
	return calculateNodeCongestion(targetId, nodes, edges);
};

export const CONGESTION_COLORS = {
	green: { solid: '#4CAF50', light: '#4CAF5066' },
	yellow: { solid: '#FFC50F', light: '#FFC50F66' },
	red: { solid: '#D97D55', light: '#D97D5566' }
} as const;

export const getAnimationDelays = (status: CongestionStatus): { send: number; recv: number } => {
	switch (status) {
		case 'green':
			return { send: 1, recv: 1 };
		case 'yellow':
			return { send: 1, recv: 2 };
		case 'red':
			return { send: 1, recv: 4 };
	}
};
