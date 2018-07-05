var Keystore = require('oip-keystore')

var KeystoreStorageAdapter = require("../lib/KeystoreStorageAdapter")

var isValidIdentifier = require("../lib/util").isValidIdentifier;

var test_account_data = { wallet: "test data", something: { subthing: { hi: "hello!"}}}
var test_account_data_2 = { wallet: "test data", something: { subthing: { hi: "hello!"}}}

var keystore_url = "http://localhost:9196"
var password = "password"

var server

beforeAll((done) => {
	server = Keystore.listen(9196, done)
})

var queries = {
	accountNoEmail: false,
	accountEmail: false
}

var checkIfAllQueriesResolved = function(){
	var allResolved = true;

	for (var q in queries){
		if (queries[q] === false)
			allResolved = false
	}

	if (allResolved)
		server.close()
}

test("Create new Account & Load (no email)", async (done) => {
	var adapter = new KeystoreStorageAdapter(undefined, password, keystore_url)

	var id = await adapter.create(test_account_data)

	test_account_data.identifier = id;

	var adapter2 = new KeystoreStorageAdapter(id, password, keystore_url)

	var account_data = await adapter2.load()

	test_account_data.shared_key = account_data.shared_key;

	expect(account_data).toEqual(test_account_data);
	expect(isValidIdentifier(account_data.identifier)).toBe(true);

	test_account_data.wallet = { bitcoin: "test-key" }

	var saved_data = await adapter2.save(test_account_data)
	var saved_account_data = await adapter2.load()

	expect(saved_account_data).toEqual(test_account_data)

	queries.accountNoEmail = true;

	checkIfAllQueriesResolved()

	done()
})

test("Create new Account & Load (email)", (done) => {
	var adapter = new KeystoreStorageAdapter(undefined, password, keystore_url)

	adapter.create(test_account_data_2, "test@example.com").then((id) => {
		test_account_data_2.identifier = id;

		var adapter2 = new KeystoreStorageAdapter("test@example.com", password, keystore_url)

		adapter2.load().then((account_data) => {
			test_account_data_2.shared_key = account_data.shared_key;

			expect(account_data).toEqual(test_account_data_2);
			expect(isValidIdentifier(account_data.identifier)).toBe(true);

			queries.accountEmail = true;

			checkIfAllQueriesResolved()

			done()
		})
	})
})