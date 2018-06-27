import StorageAdapter from './StorageAdapter'

class KeystoreStorageAdapter extends StorageAdapter {
	constructor(keystore_url, username, password){
		super(username, password)

		this._url = keystore_url;
	}
	load(){

	}
	save(){

	}
	check(){
		
	}
}

module.exports = KeystoreStorageAdapter;