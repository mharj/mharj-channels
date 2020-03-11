import {Channel} from './channel';
interface IOptions {
	replayLast?: boolean;
}
export class Channels<A extends object, C extends object> {
	private options: IOptions;
	private channels: {[key: string]: Channel<A, C>};
	private clearCallback: ((pass: C) => boolean) | undefined;
	constructor(options?: IOptions) {
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
	public deleteChannel(key: string) {
		if (this.channels[key]) {
			delete this.channels[key];
		}
	}
	public getChannels() {
		return Object.keys(this.channels).map((key) => {
			return {key, channel: this.channels[key]};
		});
	}
	public getOptions() {
		return this.options;
	}

	/**
	 * clear filter callback
	 * @param clearCallback
	 */
	public onClear(clearCallback: (pass: C) => boolean) {
		this.clearCallback = clearCallback;
	}
	/**
	 * unregistering object from all channels
	 * @param removeCallback
	 */
	public onUnRegisterAll(removeCallback: (pass: C) => boolean) {
		return Object.keys(this.channels).map((key) => {
			this.channels[key].onUnRegister(removeCallback);
		});
	}
	/**
	 * Get Channel count
	 * @return {Number}
	 */
	public count() {
		return Object.keys(this.channels).length;
	}
	/**
	 * do clean to all channels which are not active anymore
	 */
	public clean() {
		return Object.keys(this.channels).map((key) => {
			if (!this.channels[key].isActive()) {
				this.deleteChannel(key);
			}
		});
	}
}
