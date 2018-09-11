var Keystore = require('oip-keystore')

var KeystoreStorageAdapter = require("../src/StorageAdapters/KeystoreStorageAdapter")

var isValidIdentifier = require("../src/util").isValidIdentifier;

var test_account_data = { wallet: "test data", something: { subthing: { hi: "hello!"}}}
var test_account_data_2 = { wallet: "test data", something: { subthing: { hi: "hello!"}}}

var keystore_url = "http://localhost:9721"
var password = "password"

var server

beforeAll((done) => {
	server = Keystore.listen(9721, done)
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

	if (allResolved){
		server.close()
	}
}

test("Create new Account & Load (no email)", async (done) => {
	var adapter = new KeystoreStorageAdapter(undefined, password, keystore_url)

	var account_data = await adapter.create(test_account_data)

	test_account_data.identifier = account_data.identifier;
	test_account_data.shared_key = account_data.shared_key;

	expect(account_data).toEqual(test_account_data)

	var adapter2 = new KeystoreStorageAdapter(account_data.identifier, password, keystore_url)

	var account_data = await adapter2.load()

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

test("Create new Account & Load (email)", async (done) => {
	var adapter = new KeystoreStorageAdapter(undefined, password, keystore_url)

	var account_data_1 = await adapter.create(test_account_data_2, "test@example.com")
	test_account_data_2.identifier = account_data_1.identifier;
	test_account_data_2.shared_key = account_data_1.shared_key;
	test_account_data_2.email = account_data_1.email;

	expect(account_data_1).toEqual(test_account_data_2)
	expect(isValidIdentifier(account_data_1.identifier)).toBe(true);

	var adapter2 = new KeystoreStorageAdapter("test@example.com", password, keystore_url)

	var account_data = await adapter2.load()

	expect(account_data).toEqual(test_account_data_2)

	test_account_data_2.wallet = { litecoin: "test-key" }

	var saved_data = await adapter2.save(test_account_data_2)
	var saved_account_data = await adapter2.load()

	expect(saved_account_data).toEqual(test_account_data_2)

	queries.accountEmail = true;

	checkIfAllQueriesResolved()

	done()
})