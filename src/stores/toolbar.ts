import { writable } from 'svelte/store';

export enum ToolbarMenu {
	NULL = '',
	CLIENT = 'client',
	DB = 'db',
	SERVER = 'server',
	KAFKA = 'kafka',
	RABBITMQ = 'rabbitmq',
	S3 = 's3',
	LOAD_BALANCER = 'load-balancer'
}

const createToolbarStore = () => {
	const { subscribe, set } = writable<ToolbarMenu>(ToolbarMenu.NULL);

	return {
		subscribe,
		select: (menu: ToolbarMenu) => set(menu),
		reset: () => set(ToolbarMenu.NULL)
	};
};

const toolbarStore = createToolbarStore();

export default toolbarStore;
