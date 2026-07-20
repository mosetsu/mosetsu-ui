import type { Edge, Node } from '@xyflow/svelte';
import { getModule, getThroughput } from '$lib/modules';
import { calculateNodeCongestion, type CongestionStatus } from '$lib/simulation/congestion';

export type SystemSummary = {
	modules: number;
	links: number;
	ingressRps: number;
	estLatencyMs: number;
	costPerMonth: number;
	redCount: number;
	bottleneck: { title: string; status: CongestionStatus; ratio: number } | null;
};

// Latency contribution of a node, in ms (first matching metric).
const LATENCY_KEYS = ['responseTimeMs', 'readLatencyMs', 'resolveTimeMs'];
const nodeLatency = (node: Node): number => {
	const metrics = (node.data?.metrics as Record<string, number> | undefined) ?? {};
	for (const key of LATENCY_KEYS) {
		if (key in metrics) {
			return metrics[key];
		}
	}
	return 0;
};

// Longest-path latency across the graph (DAG longest weighted path), cycle-safe.
const estimateLatency = (nodes: Node[], edges: Edge[]): number => {
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const out = new Map<string, string[]>();
	nodes.forEach((n) => out.set(n.id, []));
	edges.forEach((e) => {
		if (out.has(e.source)) {
			out.get(e.source)!.push(e.target);
		}
	});

	const memo = new Map<string, number>();
	const visiting = new Set<string>();

	const dfs = (id: string): number => {
		if (memo.has(id)) {
			return memo.get(id)!;
		}
		if (visiting.has(id)) {
			return 0;
		} // break cycles
		visiting.add(id);
		const node = byId.get(id);
		const base = node ? nodeLatency(node) : 0;
		let downstream = 0;
		for (const next of out.get(id) ?? []) {
			downstream = Math.max(downstream, dfs(next));
		}
		visiting.delete(id);
		const total = base + downstream;
		memo.set(id, total);
		return total;
	};

	let max = 0;
	nodes.forEach((n) => (max = Math.max(max, dfs(n.id))));
	return Math.round(max);
};

export const computeSummary = (nodes: Node[], edges: Edge[]): SystemSummary => {
	const hasInbound = new Set(edges.map((e) => e.target));

	// Ingress = throughput entering at origin nodes (no inbound edge).
	const ingressRps = nodes
		.filter((n) => !hasInbound.has(n.id))
		.reduce(
			(sum, n) =>
				sum + getThroughput(n.type as string, (n.data?.metrics as Record<string, number>) ?? {}),
			0
		);

	const costPerMonth = nodes.reduce(
		(sum, n) => sum + (getModule(n.type as string)?.costPerMonth ?? 0),
		0
	);

	// Bottleneck = highest congestion ratio among nodes that receive traffic.
	let bottleneck: SystemSummary['bottleneck'] = null;
	let redCount = 0;
	for (const node of nodes) {
		if (!hasInbound.has(node.id)) {
			continue;
		}
		const c = calculateNodeCongestion(node.id, nodes, edges);
		if (c.status === 'red') {
			redCount++;
		}
		if (!bottleneck || c.ratio > bottleneck.ratio) {
			bottleneck = {
				title: getModule(node.type as string)?.title ?? (node.type as string),
				status: c.status,
				ratio: Math.round(c.ratio)
			};
		}
	}

	return {
		modules: nodes.length,
		links: edges.length,
		ingressRps,
		estLatencyMs: estimateLatency(nodes, edges),
		costPerMonth,
		redCount,
		bottleneck
	};
};
