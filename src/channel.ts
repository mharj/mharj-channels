import {EventEmitter} from 'events';

interface IOptions {
	replayLast?: boolean;
}
const initialOptions: IOptions = {
	replayLast: false,
};

/**
 * Channel sub/unsub system
 */
export class Channel<A extends object, C extends object> extends EventEmitter {
	private callbacks: Array<{
		pass: C;
		callback: (pass: C, listener: A) => void;
	}> = [];
	private clearCallback: ((pass: C) => boolean) | undefined;
	private options: IOptions;
	private lastMessage: A[] = [];
	constructor(options?: IOptions) {
		super();
		this.options = {...initialOptions, ...options};
	}
	/**
	 * onRegister register object and callback to callbacks array
	 * @param pass pass through object
	 * @param listenerCallback to handle message and pass through data
	 */
	public onRegister(pass: C, listenerCallback: (pass: C, message: A) => void) {
		if (!this.isActive()) {
			this.emit('active');
		}
		this.callbacks.push({pass, callback: listenerCallback});
		this.emit('register');
		if (this.options.replayLast && this.lastMessage) {
			this.lastMessage.forEach((data) => listenerCallback(pass, data));
		}
	}
	/**
	 * onUnRegister removes object and callback based on callback array filter
	 * @param removeCallback
	 */
	public onUnRegister(removeCallback: (pass: C) => boolean) {
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
	public onClear(clearCallback: (pass: C) => boolean) {
		this.clearCallback = clearCallback;
	}
	public isRegistered(regCb: (pass: C) => boolean) {
		return this.callbacks.findIndex((d) => regCb(d.pass)) !== -1;
	}

	/**
	 * Send data to callbacks
	 * @param {A} data
	 * @param {number} index
	 * @return {void}
	 */
	public send(data: A, index?: number) {
		this.doCleanup();
		const idx = index || 0;
		this.lastMessage[idx] = data;
		this.callbacks.forEach((d) => d.callback(d.pass, data));
	}

	/**
	 * Send data to callbacks once
	 * @param {A} data
	 * @param {number} index
	 * @return {void}
	 */
	public sendOnce(data: A, index?: number) {
		const idx = index || 0;
		if (JSON.stringify(data) !== JSON.stringify(this.lastMessage[idx])) {
			this.send(data, idx);
		}
	}

	/**
	 * runs cleanup filter
	 */
	public doCleanup() {
		if (this.clearCallback) {
			this.callbacks = this.callbacks.filter((d) => this.clearCallback && !this.clearCallback(d.pass));
		}
	}
	/**
	 * Get listener count
	 * @return {Number}
	 */
	public count() {
		return this.callbacks.length;
	}
	/**
	 * Do we have listener
	 * @return {Boolean}
	 */
	public isActive() {
		return this.callbacks.length > 0 ? true : false;
	}
}
