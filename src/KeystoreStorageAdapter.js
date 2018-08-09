import axios from 'axios'

import StorageAdapter from './StorageAdapter'

const DEFAULT_KEYSTORE_SERVER = "https://keystore.oip.li/v2/"

/**
 * The KeystoreStorageAdapter class is built on top of StorageAdapter to provide saving to an [OIP Keystore](https://github.com/oipwg/oip-keystore) server
 * @extends {StorageAdapter}
 */
class KeystoreStorageAdapter extends StorageAdapter {
	/**
	 * Create a new KeystoreStorageAdapter
	 * @param  {string} username     - The username of the account you wish to use
	 * @param  {string} password     - The password of the account you wish to use
	 * @param  {string} [keystore_url="https://keystore.oip.li/v2/"] - The URL of the [OIP Keystore](https://github.com/oipwg/oip-keystore) server to use
	 * @return {KeystoreStorageServer}
	 */
	constructor(username, password, keystore_url){
		super(username, password)

		this._url = keystore_url || DEFAULT_KEYSTORE_SERVER;

		this._keystore = axios.create({
			baseURL: this._url
		})
	}
	/**
	 * Create a new Account on the Keystore Server
	 *
	 * @async
	 * @param  {Object} account_data - The Account Data you wish to save to your new accouny
	 * @param  {string} [email]      - An Email if you would like to attach an email to your account
	 * @return {Promise<Object>} Returns a Promise that will resolve to the Account Data of the new account if successful
	 */
	async create(account_data, email){
		var clonedAccountData = JSON.parse(JSON.stringify(account_data));

		try {
			var create = await this._keystore.post("/create", { email: email })
		} catch(e) {
			if (e.response && e.response.data && e.response.data.type)
				throw new Error(e.response.data.type)
			throw new Error(e.response)
		}

		if (create.data.shared_key){
			this.storage.shared_key = create.data.shared_key
			clonedAccountData.shared_key = create.data.shared_key
		}
		if (create.data.email){
			this.storage.email = create.data.email
			clonedAccountData.email = create.data.email
		}

		clonedAccountData.identifier = create.data.identifier
		this.storage.identifier = create.data.identifier

		if (!this._username)
			this._username = create.data.identifier

		return this._save(clonedAccountData, this.storage.identifier)
	}
	/**
	 * Load an Account from the Keystore Server
	 *
	 * @async
	 * @return {Promise<Object>} Returns a Promise that will resolve to the Decrypted Account Data if successful
	 */
	async load(){
		try {
			var load = await this._keystore.post("/load", { identifier: this.storage.identifier || this._username })
		} catch(e) {
			throw new Error(e.response.data.type)
		}

		var decrypted = this.decrypt(load.data.encrypted_data)

		if (decrypted.shared_key)
			this.storage.shared_key = decrypted.shared_key

		return decrypted
	}
	/**
	 * Internal Save function to Save an Account to the Keystore Server
	 *
	 * @async
	 * @param  {Object} account_data - The new Account Data you wish to save
	 * @param  {Identifier} identifier - The Identifier of the account you wish to save
	 * @return {Promise<Object>} Returns a Promise that will resolve to the saved Account Data of the updated account if successful
	 */
	async _save(account_data, identifier){
		this.encrypt(account_data);

		this.storage.identifier = identifier
		
		try {
			var saved = await this._keystore.post("/update", this.storage);
		} catch(e) {
			throw new Error(e.response.data.type)
		}

		return account_data
	}
	/**
	 * Check if the Account exists on the Keystore server. This matches an email to an identifier if the username being used is an email.
	 *
	 * @async
	 * @return {Promise<Identifier>} Returns a Promsie that will resolve to the Accounts Identifier if set
	 */
	async check(){
		// If the username is not a valid identifier, try to match it to an email
		try {
			var exists = await this._keystore.post("/checkload", { identifier: this._username });
		} catch (e) {
			throw new Error(e.response.data.type)
		}

		return exists.data.identifier
	}
}

module.exports = KeystoreStorageAdapter;