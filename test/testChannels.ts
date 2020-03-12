process.env.NODE_ENV = 'test';
import {expect} from 'chai';
import 'mocha';
import {Channels} from '../src';

interface IPayload {
	msg: string;
}
interface IPassData {
	id: string;
}
let channels: Channels<IPayload, IPassData>;

describe('new Channels', () => {
	before((done) => {
		done();
	});
	describe('test channels', () => {
		it('should create channel to channels ', (done) => {
			channels = new Channels<IPayload, IPassData>({replayLast: true});
			channels.onClear((pass) => pass.id === undefined);
			const channel = channels.getChannel('01');
			channel.onRegister({id: '01'}, (pass, message) => {
				expect(pass.id).to.be.eq('01');
				expect(message).to.be.eql({msg: 'test'});
				done();
			});
			expect(channel.isRegistered((pass) => pass.id === '01')).to.be.eq(true);
			expect(channels.count()).to.be.eq(1);
			channel.send({msg: 'test'});
		});
		it('should remove listener from channel ', (done) => {
			expect(channels.count()).to.be.eq(1);
			const channel = channels.getChannel('01');
			expect(channel.count()).to.be.eq(1);
			expect(channel.isActive()).to.be.eq(true);
			channel.onUnRegister((pass) => pass.id === '01');
			expect(channel.count()).to.be.eq(0);
			expect(channel.isActive()).to.be.eq(false);
			done();
		});
		it('should remove empty channel', (done) => {
			expect(channels.count()).to.be.eq(1);
			channels.clean();
			expect(channels.count()).to.be.eq(0);
			done();
		});
		it('add two listeners', (done) => {
			const channel = channels.getChannel('01');
			channel.onRegister({id: '01'}, (pass, message) => {
				expect(pass.id).to.be.eq('01');
				expect(message).to.be.eql({msg: 'test'});
				channel.onRegister({id: '01'}, (pass, message) => {
					done();
				});
			});
			expect(channel.isRegistered((pass) => pass.id === '01')).to.be.eq(true);
			expect(channels.count()).to.be.eq(1);
			channel.send({msg: 'test'});
		});
		it('should remove listener from all channels', (done) => {
			expect(channels.count()).to.be.eq(1);
			const channel = channels.getChannel('01');
			expect(channel.count()).to.be.eq(2);
			expect(channel.isActive()).to.be.eq(true);
			channels.onUnRegisterAll((pass) => pass.id === '01');
			expect(channel.count()).to.be.eq(0);
			expect(channel.isActive()).to.be.eq(false);
			done();
		});
	});
});
