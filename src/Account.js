import { Wallet, util } from 'oip-hdmw';
import { isValidEmail, isValidIdentifier, isValidSharedKey } from './util';

import FakeStorageAdapter from './FakeStorageAdapter';
import LocalStorageAdapter from './LocalStorageAdapter';
import KeystoreStorageAdapter from './KeystoreStorageAdapter';

const DEFAULT_KEYSTORE_SERVER = "https://keystore.oip.li/"

class Account {
	/**
	 * Create a new Account
	 * @param  {string} username - Pass in your Email, Account ID, or a BIP39 Mnemonic
	 * @param  {string} password - Your Accounts password
	 * @param  {Object} options  - Options about the Account being spawned
	 * @param  {Boolean} [options.store_local=false] - If the wallet should be stored locally or on a Keystore server
	 * @param  {string} [options.keystore_url="https://keystore.oip.li/"] - Keystore to use to store the Account
	 * @return {Account}
	 */
	constructor(username, password, options){
		this._username = username
		this._password = password

		this._account = {
			identifier: "",
			email: "",
			wallet: {

			},
			settings: {

			},
			history: {

			}
		}

		// Detect what kind of Username we are being passed.
		if (options && options.store_local) {
			this._storageAdapter = new LocalStorageAdapter(this._username, this._password);
		} else if (options && options.store_in_keystore) {
			if (options.keystore_url){
				this._storageAdapter = new KeystoreStorageAdapter(options.keystore_url, this._username, this._password);
			} else {
				this._storageAdapter = new KeystoreStorageAdapter(DEFAULT_KEYSTORE_SERVER, this._username, this._password);
			}
		} else if (util.isMnemonic(this._username)){
			this._account.wallet.mnemonic = this._username;
			this._storageAdapter = new FakeStorageAdapter(this._account);
		} else if (!this._username && !this._password) {
			this._storageAdapter = new FakeStorageAdapter(this._account);
		}

		this.discover = true

		if (options && options.discover !== undefined)
			this.discover = options.discover
	}
	/**
	 * Create a new Wallet and save it to the Storage Adapter
	 * @return {Promise} Returns a Promise that resolves if the wallet is created successfully.
	 */
	create(){
		return new Promise((resolve, reject) => {
			this._storageAdapter.check().then((identifier) => {
				reject(new Error("Account already exists!"), identifier)
			}).catch(() => {
				this.wallet = new Wallet(undefined, {discover: this.discover });

				this._account.wallet.mnemonic = this.wallet.getMnemonic()

				this.store().then((identifier) => {
					resolve(this._account);
				}).catch(reject)
			});
		})
	}
	/**
	 * Login to the Selected Account. This spawns and creates the oip-hdmw account.
	 * @return {Promise} Returns a Promise that resolves after logging in successfully.
	 */
	login(){
		return new Promise((resolve, reject) => {
			this._storageAdapter.load().then((account_info) => {
				this._account = account_info;

				if (!this._account.wallet.mnemonic)
					reject(new Error("Accounts not containing a Wallet Mnemonic are NOT SUPPORTED!"))

				this.wallet = new Wallet(this._account.wallet.mnemonic, {discover: this.discover})

				resolve(this._account)
			}).catch(reject)
		})
	}
	logout(){
		this._wallet = undefined;
		this._account = undefined;
	}
	store(){
		return this._storageAdapter.save(this._account)
	}
}

module.exports = Account