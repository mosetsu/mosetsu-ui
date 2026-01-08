import Client from '$components/arena/blocks/Client.svelte';
import Server from '$components/arena/blocks/Server.svelte';
import Database from '$components/arena/blocks/Database.svelte';
import Kafka from '$components/arena/blocks/Kafka.svelte';
import RabbitMQ from '$components/arena/blocks/RabbitMQ.svelte';
import S3 from '$components/arena/blocks/S3.svelte';
import LoadBalancer from '$components/arena/blocks/LoadBalancer.svelte';
import AnimatedEdge from '$components/arena/edges/AnimatedEdge.svelte';
import { DEFAULT_METRICS } from '$stores/block';

import type { Component } from 'svelte';
import type { Edge, Node } from '@xyflow/svelte';
import type { NodeProps, EdgeProps } from '@xyflow/svelte';

type NodeTypes = Record<string, Component<NodeProps>>;
type EdgeTypes = Record<string, Component<EdgeProps>>;

export class DrawStateClass {
	container: HTMLDivElement | null = null;
	nodes = $state.raw<Node[]>([]);
	edges = $state.raw<Edge[]>([]);
	panEnabled = $state<boolean>(true);

	nodeTypes: NodeTypes = {
		client: Client,
		server: Server,
		db: Database,
		kafka: Kafka,
		rabbitmq: RabbitMQ,
		s3: S3,
		'load-balancer': LoadBalancer
	};

	edgeTypes: EdgeTypes = {
		default: AnimatedEdge
	};

	setContainer = (container: HTMLDivElement) => {
		this.container = container;
	};

	getContainer = () => {
		return this.container;
	};

	addClientNode = (x: number, y: number) => {
		this.nodes = [
			...this.nodes,
			{
				id: `client-${this.nodes.length}`,
				type: 'client',
				position: { x, y },
				data: { metrics: { ...DEFAULT_METRICS.client } }
			}
		];
	};

	addServerNode = (x: number, y: number) => {
		this.nodes = [
			...this.nodes,
			{
				id: `server-${this.nodes.length}`,
				type: 'server',
				position: { x, y },
				data: { metrics: { ...DEFAULT_METRICS.server } }
			}
		];
	};

	addDbNode = (x: number, y: number) => {
		this.nodes = [
			...this.nodes,
			{
				id: `db-${this.nodes.length}`,
				type: 'db',
				position: { x, y },
				data: { metrics: { ...DEFAULT_METRICS.db } }
			}
		];
	};

	addKafkaNode = (x: number, y: number) => {
		this.nodes = [
			...this.nodes,
			{
				id: `kafka-${this.nodes.length}`,
				type: 'kafka',
				position: { x, y },
				data: { metrics: { ...DEFAULT_METRICS.kafka } }
			}
		];
	};

	addRabbitMQNode = (x: number, y: number) => {
		this.nodes = [
			...this.nodes,
			{
				id: `rabbitmq-${this.nodes.length}`,
				type: 'rabbitmq',
				position: { x, y },
				data: { metrics: { ...DEFAULT_METRICS.rabbitmq } }
			}
		];
	};

	addS3Node = (x: number, y: number) => {
		this.nodes = [
			...this.nodes,
			{
				id: `s3-${this.nodes.length}`,
				type: 's3',
				position: { x, y },
				data: { metrics: { ...DEFAULT_METRICS.s3 } }
			}
		];
	};

	addLoadBalancerNode = (x: number, y: number) => {
		this.nodes = [
			...this.nodes,
			{
				id: `load-balancer-${this.nodes.length}`,
				type: 'load-balancer',
				position: { x, y },
				data: { metrics: { ...DEFAULT_METRICS['load-balancer'] } }
			}
		];
	};

	destroy = () => {
		this.container = null;
		this.nodes = [];
		this.edges = [];
		this.panEnabled = true;
		this.nodeTypes = {};
		this.edgeTypes = {};
	};
}

export const drawState = new DrawStateClass();
