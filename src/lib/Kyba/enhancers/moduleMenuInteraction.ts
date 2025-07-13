import moduleMenuStore, { ModuleMenu } from '$stores/moduleMenu';
import ClientModule from './clientModule';
import type { KybaInterface } from '../types';

const ModuleMenuInteraction = (controller: KybaInterface): (() => void) => {
	let isActive = false;

	const resetModuleMenu = () => {
		isActive = false;
		moduleMenuStore.reset();
	};

	moduleMenuStore.subscribe((moduleMenu) => {
		if (moduleMenu && !isActive) {
			isActive = true;
			if (moduleMenu === ModuleMenu.CLIENT) {
				ClientModule(controller, resetModuleMenu);
			}
		}
	});

	return () => {};
};

export default ModuleMenuInteraction;
