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
		var create = await this._keystore.post("/create", { email: email })
		var clonedAccountData = JSON.parse(JSON.stringify(account_data));

		if (create.data.error)
			throw new Error(create.data.error.type)

		if (create.data.shared_key){
			this.storage.shared_key = create.data.shared_key
			clonedAccountData.shared_key = create.data.shared_key
		}

		clonedAccountData.identifier = create.data.identifier
		this.storage.identifier = create.data.identifier

		return this._save(clonedAccountData, this.storage.identifier)
	}
	async load(){
		var load = await this._keystore.post("/load", { identifier: this.storage.identifier || this._username })

		if (load.data.error)
			throw new Error(load.data.error.type)

		var decrypted = this.decrypt(load.data.encrypted_data)

		if (decrypted.shared_key)
			this.storage.shared_key = decrypted.shared_key

		return decrypted
	}
	async _save(account_data, identifier){
		this.encrypt(account_data);
		
		var saved = await this._keystore.post("/update", this.storage);

		if (saved.data.error)
			throw new Error(saved.data.error.type)

		return saved.data.identifier
	}
	async check(){
		var exists = await this._keystore.post("/checkload", { identifier: this._username });

		if (exists.error)
			throw new Error(exists.error.type)

		return exists
	}
}

module.exports = KeystoreStorageAdapter;