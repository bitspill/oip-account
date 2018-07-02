import StorageAdapter from './StorageAdapter'

class FakeStorageAdapter extends StorageAdapter {
	constructor(account){
		super(undefined, undefined)
		this._account = account		
	}
	async load(){
		return this._account
	}
	async save(account_data, identifier){
		if (!identifier){
			return await this.create(account_data)
		} else {
			this._account = account_data
			return identifier
		}
	}
	async check(){
		throw new Error("Account Not Found!")
	}
}

module.exports = FakeStorageAdapter;