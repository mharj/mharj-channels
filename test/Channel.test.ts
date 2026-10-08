import {describe, expect, it} from 'vitest';
import {Channel} from '../src';

interface IPayload {
	msg: string;
}
interface IPassData {
	id: string;
}
let channel: Channel<IPayload, IPassData>;

describe('new Channel', () => {
	describe('test channel', () => {
		it('should create channel', () => {
			channel = new Channel<IPayload, IPassData>({replayLast: true});
			channel.onClear((pass) => pass.id === undefined);
		});
		it('should register listener and send test', async () => {
			const callbackPromise = new Promise<void>((resolve) => {
				channel.onRegister({id: '01'}, (pass, message) => {
					expect(pass.id).toBe('01');
					expect(message).toEqual({msg: 'test'});
					resolve();
				});
			});
			expect(channel.isRegistered((pass) => pass.id === '01')).toBe(true);
			expect(channel.count()).toBe(1);
			expect(channel.isActive()).toBe(true);
			channel.send({msg: 'test'});
			await callbackPromise;
		});
		it('should unregister listener', () => {
			channel.onUnRegister((pass) => pass.id === '01');
			expect(channel.isRegistered((pass) => pass.id === '01')).toBe(false);
			expect(channel.count()).toBe(0);
			expect(channel.isActive()).toBe(false);
		});
	});
});
