/** Reactive message for a transient `<Toast>`, cleared after `duration` ms. */
export function createToast(duration = 2000) {
	let message = $state('');
	let timer: ReturnType<typeof setTimeout> | null = null;

	return {
		get message() {
			return message;
		},
		show(msg: string) {
			message = msg;
			if (timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(() => (message = ''), duration);
		}
	};
}
