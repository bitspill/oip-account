import StorageAdapter from './StorageAdapter'

class FakeStorageAdapter extends StorageAdapter {
	constructor(account){
		super(undefined, undefined)
		this._account = account		
	}
	load(){
		return new Promise((resolve, reject) => {
			resolve(this._account)
		})
	}
	save(account_data, identifier){
		return new Promise((resolve, reject) => {
			if (!identifier){
				this.create(account_data).then(resolve).catch(reject)
			} else {
				this._account = account_data
				resolve(identifier)
			}
		}) 
	}
	check(){
		return new Promise((resolve, reject) => {
			reject()
		})
	}
}

module.exports = FakeStorageAdapter;