import axios from 'axios'

import StorageAdapter from './StorageAdapter'

class KeystoreStorageAdapter extends StorageAdapter {
	constructor(username, password, keystore_url){
		super(username, password)

		this._url = keystore_url;

		this._keystore = axios.create({
			baseURL: this._url
		})
	}
	async create(account_data, email){
		var clonedAccountData = JSON.parse(JSON.stringify(account_data));

		try {
			var create = await this._keystore.post("/create", { email: email })
		} catch(e) {
			throw new Error(e.response.data.type)
		}

		if (create.data.shared_key){
			this.storage.shared_key = create.data.shared_key
			clonedAccountData.shared_key = create.data.shared_key
		}

		clonedAccountData.identifier = create.data.identifier
		this.storage.identifier = create.data.identifier

		return this._save(clonedAccountData, this.storage.identifier)
	}
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
	async _save(account_data, identifier){
		this.encrypt(account_data);

		this.storage.identifier = identifier
		
		try {
			var saved = await this._keystore.post("/update", this.storage);
		} catch(e) {
			throw new Error(e.response.data.type)
		}

		return saved.data.identifier
	}
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