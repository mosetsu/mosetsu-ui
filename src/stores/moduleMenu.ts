import { writable } from 'svelte/store';

export enum ModuleMenu {
	NULL = '',
	CLIENT = 'client',
	DB = 'db',
	SERVER = 'server',
	LINK = 'link'
}

const createModuleMenuStore = () => {
	const { subscribe, set } = writable<ModuleMenu>(ModuleMenu.NULL);

	return {
		subscribe,
		select: (menu: ModuleMenu) => set(menu),
		reset: () => set(ModuleMenu.NULL)
	};
};

const moduleMenuStore = createModuleMenuStore();

export default moduleMenuStore;
