import StorageAdapter from './StorageAdapter'

if (typeof localStorage === "undefined" || localStorage === null) {
	var LocalStorage = require('node-localstorage').LocalStorage;
	var localStorage = new LocalStorage('./localStorage');
}

class LocalStorageAdapter extends StorageAdapter {
	constructor(username, password){
		super(username, password)		
	}
	async load(){
		var id = await this.check()

		var stored_data = localStorage.getItem('oip_account');

		stored_data = JSON.parse(stored_data)

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
	async _save(account_data, identifier){
		var stored_data = localStorage.getItem('oip_account');

		if (stored_data) 
			stored_data = JSON.parse(stored_data);

		if (!stored_data)
			stored_data = {}

		this.encrypt(account_data);

		stored_data[identifier] = this.storage;

		localStorage.setItem('oip_account', JSON.stringify(stored_data))

		return identifier
	}
	/**
	 * Check if the Account already exists
	 * @return {Promise} Returns a Promise that will resolve to `true` if the account already exists and has been created, and `false` if the account doesn't exist
	 */
	async check(){
		var stored_data = localStorage.getItem('oip_account');

		stored_data = JSON.parse(stored_data);

		if (!stored_data)
			throw new Error("Account Not Found!");

		if (this.storage.identifier !== "" && stored_data[this.storage.identifier])
			return this.storage.identifier

		if (stored_data[this._username])
			return this._username

		for (var data in stored_data){
			// Check if the Email matches
			if (stored_data[data].email && stored_data[data].email !== "" && stored_data[data].email === this._username && this._username)
				return data
		}

		throw new Error("Account Not Found!")
	}
}

module.exports = LocalStorageAdapter;