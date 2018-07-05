import StorageAdapter from './StorageAdapter'

class MemoryStorageAdapter extends StorageAdapter {
	constructor(account){
		super(undefined, undefined)
		this._account = account		
	}
	async load(){
		return this._account
	}
	async _save(account_data, identifier){
		if (!account_data.identifier)
			account_data.identifier = identifier;

		this._account = account_data
		
		return identifier
	}
	async check(){
		throw new Error("Account Not Found!")
	}
}

module.exports = MemoryStorageAdapter;