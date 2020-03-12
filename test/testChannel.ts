process.env.NODE_ENV = 'test';
import {expect} from 'chai';
import 'mocha';
import {Channel} from '../src';

interface IPayload {
	msg: string;
}
interface IPassData {
	id: string;
}
let channel: Channel<IPayload, IPassData>;

describe('new Channel', () => {
	before((done) => {
		done();
	});
	describe('test channel', () => {
		it('should create channel', (done) => {
			channel = new Channel<IPayload, IPassData>({replayLast: true});
			channel.onClear((pass) => pass.id === undefined);
			done();
		});
		it('should register listener and send test', (done) => {
			channel.onRegister({id: '01'}, (pass, message) => {
				expect(pass.id).to.be.eq('01');
				expect(message).to.be.eql({msg: 'test'});
				done();
			});
			expect(channel.isRegistered((pass) => pass.id === '01')).to.be.eq(true);
			expect(channel.count()).to.be.eq(1);
			expect(channel.isActive()).to.be.eq(true);
			channel.send({msg: 'test'});
		});
		it('should unregister listener', (done) => {
			channel.onUnRegister((pass) => pass.id === '01');
			expect(channel.isRegistered((pass) => pass.id === '01')).to.be.eq(false);
			expect(channel.count()).to.be.eq(0);
			expect(channel.isActive()).to.be.eq(false);
			done();
		});
	});
});
