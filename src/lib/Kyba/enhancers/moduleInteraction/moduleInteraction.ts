import moduleMenuStore, { ModuleMenu } from '$stores/moduleMenu';
import ClientModule from './modules/client';
import LinkModule from './modules/link';
import type { KybaInterface } from '$lib/Kyba/types';

const ModuleInteraction = (controller: KybaInterface): (() => void) => {
	let tearDown: () => void = () => {};

	const resetModuleMenu = () => {
		moduleMenuStore.reset();
	};

	moduleMenuStore.subscribe((moduleMenu) => {
		tearDown();
		if (moduleMenu === ModuleMenu.CLIENT) {
			tearDown = ClientModule(controller, resetModuleMenu);
		} else if (moduleMenu === ModuleMenu.LINK) {
			tearDown = LinkModule(controller, resetModuleMenu);
		}
	});

	return () => {};
};

export default ModuleInteraction;
