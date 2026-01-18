export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

class ToastStore {
	toasts = $state<Toast[]>([]);

	add(message: string, type: ToastType = 'info', duration: number = 5000) {
		const id = Math.random().toString(36).substring(2, 9);
		const toast: Toast = { id, message, type, duration };
		
		this.toasts.push(toast);

		if (duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, duration);
		}
	}

remove(id: string) {
    console.log('removing', id, 'from', this.toasts.map(t => t.id));
    this.toasts = this.toasts.filter(t => t.id !== id);
    console.log('after remove', this.toasts.map(t => t.id));
}

	success(message: string, duration?: number) {
		this.add(message, 'success', duration);
	}

	error(message: string, duration?: number) {
		this.add(message, 'error', duration);
	}

	info(message: string, duration?: number) {
		this.add(message, 'info', duration);
	}

	warning(message: string, duration?: number) {
		this.add(message, 'warning', duration);
	}
}

export const toast = new ToastStore();