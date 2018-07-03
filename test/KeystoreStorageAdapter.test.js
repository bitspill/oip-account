var OIPKeystore = require('oip-keystore')

var KeystoreStorageAdapter = require("../lib/KeystoreStorageAdapter")

var isValidIdentifier = require("../lib/util").isValidIdentifier;

var test_account_data = { wallet: "test data", something: { subthing: { hi: "hello!"}}}

var keystore_url = "http://localhost:9196"
var password = "password"

var server

beforeAll((done) => {
	server = OIPKeystore.listen(9196, done)
})

test("Create new Account & Load", (done) => {
	var adapter = new KeystoreStorageAdapter(undefined, password, keystore_url)

	adapter.create(test_account_data).then((id) => {
		test_account_data.identifier = id;

		adapter.load().then((account_data) => {
			expect(account_data).toEqual(test_account_data);
			expect(isValidIdentifier(account_data.identifier)).toBe(true);
			server.close()
			done()
		})
	})
})