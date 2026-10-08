import {Channel} from './channel';

interface IOptions {
	replayLast?: boolean;
}

export class Channels<A extends object, C extends object> {
	private options: IOptions;
	private channels: {[key: string]: Channel<A, C>};
	private clearCallback: ((pass: C) => boolean) | undefined;
	public constructor(options?: IOptions) {
		this.options = options || {};
		this.channels = {};
	}
	/**
	 * Get Channel for key and create one if not existing
	 * @param {String} key channel key
	 * @return {Channel}
	 */
	public getChannel(key: string): Channel<A, C> {
		if (!this.channels[key]) {
			this.channels[key] = new Channel(this.options);
			if (this.clearCallback) {
				this.channels[key].onClear(this.clearCallback);
			}
		}
		return this.channels[key];
	}
	/**
	 * Deletes specific Channel if exists
	 * @param {String} key channel key
	 * @return {undefined}
	 */
	public deleteChannel(key: string): void {
		if (this.channels[key]) {
			delete this.channels[key];
		}
	}
	public getChannels(): {key: string; channel: Channel<A, C>}[] {
		return Object.keys(this.channels).map((key) => {
			return {key, channel: this.channels[key]};
		});
	}
	public getOptions(): IOptions {
		return this.options;
	}

	/**
	 * clear filter callback
	 * @param clearCallback
	 */
	public onClear(clearCallback: (pass: C) => boolean): void {
		this.clearCallback = clearCallback;
	}
	/**
	 * unregistering object from all channels
	 * @param removeCallback
	 */
	public onUnRegisterAll(removeCallback: (pass: C) => boolean): void {
		for (const channel of Object.keys(this.channels)) {
			this.channels[channel].onUnRegister(removeCallback);
		}
	}
	/**
	 * Get Channel count
	 * @return {Number}
	 */
	public count(): number {
		return Object.keys(this.channels).length;
	}
	/**
	 * do clean to all channels which are not active anymore
	 */
	public clean(): void {
		for (const channel of Object.keys(this.channels)) {
			if (!this.channels[channel].isActive()) {
				this.deleteChannel(channel);
			}
		}
	}
}
