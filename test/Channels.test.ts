import {describe, expect, it} from 'vitest';
import {Channels} from '../src';

interface IPayload {
	msg: string;
}
interface IPassData {
	id: string;
}
let channels: Channels<IPayload, IPassData>;

describe('new Channels', () => {
	describe('test channels', () => {
		it('should create channel to channels ', async () => {
			channels = new Channels<IPayload, IPassData>({replayLast: true});
			channels.onClear((pass) => pass.id === undefined);
			const channel = channels.getChannel('01');
			const onRegisterPromise = new Promise<void>((resolve) => {
				channel.onRegister({id: '01'}, (pass, message) => {
					expect(pass.id).toBe('01');
					expect(message).toEqual({msg: 'test'});
					resolve();
				});
			});
			expect(channel.isRegistered((pass) => pass.id === '01')).to.be.eq(true);
			expect(channels.count()).to.be.eq(1);
			channel.send({msg: 'test'});
			await onRegisterPromise;
		});
		it('should remove listener from channel ', () => {
			expect(channels.count()).to.be.eq(1);
			const channel = channels.getChannel('01');
			expect(channel.count()).to.be.eq(1);
			expect(channel.isActive()).to.be.eq(true);
			channel.onUnRegister((pass) => pass.id === '01');
			expect(channel.count()).to.be.eq(0);
			expect(channel.isActive()).to.be.eq(false);
		});
		it('should remove empty channel', () => {
			expect(channels.count()).to.be.eq(1);
			channels.clean();
			expect(channels.count()).to.be.eq(0);
		});
		it('add two listeners', async () => {
			const channel = channels.getChannel('01');
			const onRegisterPromise = new Promise<void>((resolve) => {
				channel.onRegister({id: '01'}, (pass, message) => {
					expect(pass.id).to.be.eq('01');
					expect(message).to.be.eql({msg: 'test'});
					channel.onRegister({id: '01'}, (_pass, _message) => {
						resolve();
					});
				});
			});
			expect(channel.isRegistered((pass) => pass.id === '01')).to.be.eq(true);
			expect(channels.count()).to.be.eq(1);
			channel.send({msg: 'test'});
			await onRegisterPromise;
		});
		it('should remove listener from all channels', () => {
			expect(channels.count()).to.be.eq(1);
			const channel = channels.getChannel('01');
			expect(channel.count()).to.be.eq(2);
			expect(channel.isActive()).to.be.eq(true);
			channels.onUnRegisterAll((pass) => pass.id === '01');
			expect(channel.count()).to.be.eq(0);
			expect(channel.isActive()).to.be.eq(false);
		});
	});
});
