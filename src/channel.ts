import {EventEmitter} from 'events';

interface IOptions {
	replayLast?: boolean;
}
const initialOptions: IOptions = {
	replayLast: false,
};

export type ChannelEvents = {
	active: [];
	register: [];
	unregister: [];
	inactive: [];
};

/**
 * Channel sub/unsub system
 */
export class Channel<A extends object, C extends object> extends EventEmitter<ChannelEvents> {
	private callbacks: Array<{
		pass: C;
		callback: (pass: C, listener: A) => void;
	}> = [];
	private clearCallback: ((pass: C) => boolean) | undefined;
	private options: IOptions;
	private lastMessage: A[] = [];
	public constructor(options?: IOptions) {
		super();
		this.options = {...initialOptions, ...options};
	}
	/**
	 * onRegister register object and callback to callbacks array
	 * @param pass pass through object
	 * @param listenerCallback to handle message and pass through data
	 */
	public onRegister(pass: C, listenerCallback: (pass: C, message: A) => void): void {
		if (!this.isActive()) {
			this.emit('active');
		}
		this.callbacks.push({pass, callback: listenerCallback});
		this.emit('register');
		if (this.options.replayLast && this.lastMessage) {
			for (const data of this.lastMessage) {
				listenerCallback(pass, data);
			}
		}
	}
	/**
	 * onUnRegister removes object and callback based on callback array filter
	 * @param removeCallback
	 */
	public onUnRegister(removeCallback: (pass: C) => boolean): void {
		const was = this.isActive();
		this.callbacks = this.callbacks.filter((d) => !removeCallback(d.pass));
		this.emit('unregister');
		if (was && !this.isActive()) {
			this.emit('inactive');
		}
	}

	/**
	 * clear filter callback
	 * @param clearCallback
	 */
	public onClear(clearCallback: (pass: C) => boolean): void {
		this.clearCallback = clearCallback;
	}
	public isRegistered(regCb: (pass: C) => boolean): boolean {
		return this.callbacks.findIndex((d) => regCb(d.pass)) !== -1;
	}

	/**
	 * Send data to callbacks
	 * @param {A} data
	 * @param {number} index
	 * @return {void}
	 */
	public send(data: A, index?: number): void {
		this.doCleanup();
		const idx = index || 0;
		this.lastMessage[idx] = data;
		for (const callback of this.callbacks) {
			callback.callback(callback.pass, data);
		}
	}

	/**
	 * Send data to callbacks once
	 * @param {A} data
	 * @param {number} index
	 * @return {void}
	 */
	public sendOnce(data: A, index?: number): void {
		const idx = index || 0;
		if (JSON.stringify(data) !== JSON.stringify(this.lastMessage[idx])) {
			this.send(data, idx);
		}
	}

	/**
	 * runs cleanup filter
	 */
	public doCleanup(): void {
		if (this.clearCallback) {
			this.callbacks = this.callbacks.filter((d) => this.clearCallback && !this.clearCallback(d.pass));
		}
	}
	/**
	 * Get listener count
	 * @return {Number}
	 */
	public count(): number {
		return this.callbacks.length;
	}
	/**
	 * Do we have listener
	 * @return {Boolean}
	 */
	public isActive(): boolean {
		return this.callbacks.length > 0;
	}
}
