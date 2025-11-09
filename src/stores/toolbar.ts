import { writable } from 'svelte/store';

export enum ToolbarMenu {
	NULL = '',
	CLIENT = 'client',
	DB = 'db',
	SERVER = 'server',
	LINK = 'link'
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
