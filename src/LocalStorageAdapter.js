import StorageAdapter from './StorageAdapter'

if (typeof localStorage === "undefined" || localStorage === null) {
	var LocalStorage = require('node-localstorage').LocalStorage;
	var localStorage = new LocalStorage('./localStorage');
}

class LocalStorageAdapter extends StorageAdapter {
	constructor(username, password){
		super(username, password)		
	}
	load(){
		return new Promise((resolve, reject) => {
			this.check().then((id) => {
				var stored_data = localStorage.getItem('oip_account');

				stored_data = JSON.parse(stored_data)

				if (stored_data[id]){
					var decrypted_data = this.decrypt(stored_data[id].encrypted_data);

					if (decrypted_data){

						if (!decrypted_data.identifier)
							decrypted_data.identifier = id;

						resolve(decrypted_data)
					}
				} else {
					reject(new Error("Account Not Found for ID!"))
				}

				reject(new Error("Unable to Decrypt Account!"))
			}).catch(reject)
		})
	}
	save(account_data, identifier){
		return new Promise((resolve, reject) => {
			var saveAccountData = (acc_data, ident) => {
				var stored_data = localStorage.getItem('oip_account');

				if (stored_data) 
					stored_data = JSON.parse(stored_data);

				if (!stored_data)
					stored_data = {}

				this.encrypt(account_data);

				stored_data[ident] = this.storage;

				localStorage.setItem('oip_account', JSON.stringify(stored_data))

				resolve(ident)
			}

			if (identifier){
				saveAccountData(account_data, identifier)
			} else {
				this.check().then((id) => {
					saveAccountData(account_data, id)
				}).catch(() => {
					this.create(account_data).then((iden) => {
						resolve(iden)
					}).catch(reject)
				})
			}
		}) 
	}
	/**
	 * Check if the Account already exists
	 * @return {Promise} Returns a Promise that will resolve to `true` if the account already exists and has been created, and `false` if the account doesn't exist
	 */
	check(){
		return new Promise((resolve, reject) => {
			var stored_data = localStorage.getItem('oip_account');

			stored_data = JSON.parse(stored_data);

			if (!stored_data)
				reject(new Error("Account Not Found!"));

			if (this.storage.identifier !== "" && stored_data[this.storage.identifier])
				resolve(this.storage.identifier);

			if (stored_data[this._username])
				resolve(this._username);

			for (var data in stored_data){
				// Check if the Email matches
				if (stored_data[data].email && stored_data[data].email !== "" && stored_data[data].email === this._username && this._username)
					resolve(data)
			}

			reject(new Error("Account Not Found!"))
		})
	}
}

module.exports = LocalStorageAdapter;