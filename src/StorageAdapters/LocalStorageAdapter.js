import StorageAdapter from './StorageAdapter'
import { InvalidPassword, AccountNotFoundError } from '../Errors'
import CryptoJS from 'crypto-js';

const AES_CONFIG = {
	mode: CryptoJS.mode.CTR,
	padding: CryptoJS.pad.Iso10126,
	iterations: 5
};

if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
	if (typeof localStorage === "undefined") {
		var LocalStorage = require('node-localstorage').LocalStorage;
		var localStorage = new LocalStorage('./localStorage');
	}
} else {localStorage = window.localStorage}

/**
 * LocalStorageAdapter allows saving of Wallets to the users local computer if they don't wish to store it on a Keystore server.
 * @extends {StorageAdapter}
 */
class LocalStorageAdapter extends StorageAdapter {
	/**
	 * Create a new LocalStorageAdapter
	 * @param  {string} username - The username of the account you wish to use
	 * @param  {string} password - The password of the account you wish to use
	 * @return {LocalStorageAdapter}
	 */
	constructor(username, password){
		super(username, password)		
	}
	/**
	 * Load the Account from LocalStorage
	 *
	 * @async
	 * @throws {InvalidPassword} If the password being used for login is invalid
	 * @throws {AccountNotFoundError} If the Account cannot beb found on the storage server
	 * @return {Promise<Object>} Returns a Promise that will resolve to the Decrypted Account Data if successful
	 */
	async load(){
		var id

		try {
			id = await this.check();
		} catch (e){
			throw new AccountNotFoundError(`Unable to get Identifier ${e}`)
		}

		var stored_data = localStorage.getItem('oip_account');

		stored_data = JSON.parse(stored_data);

		if (stored_data[id]){
			var decrypted_data

			try {
				decrypted_data = this.decrypt(stored_data[id].encrypted_data);
			} catch (e) {
				throw new InvalidPassword("Password is not Valid\n" + e)
			}

			if (decrypted_data){
				if (!decrypted_data.identifier)
					decrypted_data.identifier = id;

				return decrypted_data
			}
		} else {
			throw new AccountNotFoundError("Account not found for " + id + " in LocalStorage")
		}

		throw new Error("Unable to Decrypt Account!")
	}
	/**
	 * Internal Save function to Save an Account to LocalStorage
	 *
	 * @async
	 * @param  {Object} account_data - The new Account Data you wish to save
	 * @param  {Identifier} identifier - The Identifier of the account you wish to save
	 * @return {Promise<Object>} Returns a Promise that will resolve to the Account Data of the updated account if successful
	 */
	async _save(account_data, identifier){
		var stored_data = localStorage.getItem('oip_account');

		if (stored_data) 
			stored_data = JSON.parse(stored_data);

		if (!stored_data)
			stored_data = {};

		this.encrypt(account_data);

		stored_data[identifier] = this.storage;

		localStorage.setItem('oip_account', JSON.stringify(stored_data));

		return account_data
	}
	/**
	 * Check if the Account exists in LocalStorage. 
	 * This matches an email to an identifier if the username being used is an email.
	 *
	 * @async
	 * @return {Promise<Identifier>} Returns a Promsie that will resolve to the Accounts Identifier if set
	 */
	async check(){
		var stored_data = localStorage.getItem('oip_account');

		stored_data = JSON.parse(stored_data);

		if (!stored_data)
			throw new AccountNotFoundError();

		if (this.storage.identifier !== "" && stored_data[this.storage.identifier])
			return this.storage.identifier;

		if (stored_data[this._username])
			return this._username;

		for (var data in stored_data){
			// Check if the Email matches
			if (stored_data[data].email && stored_data[data].email !== "" && this._username && stored_data[data].email === this._username)
				return data;
		}

		if (this.storage.seed) {
			try {
				return await this.checkForMnemonic()
			} catch(err) {
				throw err
			}
		}

		throw new AccountNotFoundError()
	}

	/**
	 * Check if the Account exists in LocalStorage by searching for mnemonic in encrypted data.
	 *
	 * @async
	 * @return {Promise<Identifier>} Returns a Promsie that will resolve to the Accounts Identifier if set
	 */
	async checkForMnemonic(){
		let stored_data = localStorage.getItem('oip_account');

		stored_data = JSON.parse(stored_data);

		if (!stored_data)
			throw new AccountNotFoundError();

		for (let data in stored_data){
			// Check if the Email matches
			let decrypted_data = CryptoJS.AES.encrypt(stored_data[data].encrypted_data, this._password, AES_CONFIG);

			if (decrypted_data.wallet) {
				if (decrypted_data.wallet.seed === this.storage.seed) {
					return data
				}
			}
		}
		throw new AccountNotFoundError(`Unable to find mnemonic`)
	}
}

module.exports = LocalStorageAdapter;