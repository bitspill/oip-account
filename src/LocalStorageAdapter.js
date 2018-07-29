import StorageAdapter from './StorageAdapter'

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
	 * @return {Promise<Object>} Returns a Promise that will resolve to the Decrypted Account Data if successful
	 */
	async load(){
		var id = await this.check();

		var stored_data = localStorage.getItem('oip_account');

		stored_data = JSON.parse(stored_data);

		if (stored_data[id]){
			var decrypted_data = this.decrypt(stored_data[id].encrypted_data);

			if (decrypted_data){
				if (!decrypted_data.identifier)
					decrypted_data.identifier = id;

				return decrypted_data
			}
		} else {
			throw new Error("Account Not Found for ID!")
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
			throw new Error("Account Not Found!");

		if (this.storage.identifier !== "" && stored_data[this.storage.identifier])
			return this.storage.identifier;

		if (stored_data[this._username])
			return this._username;

		for (var data in stored_data){
			// Check if the Email matches
			if (stored_data[data].email && stored_data[data].email !== "" && this._username && stored_data[data].email === this._username)
				return data;
		}

		throw new Error("Account Not Found!")
	}
}

module.exports = LocalStorageAdapter;