var LocalStorageAdapter = require("../lib/LocalStorageAdapter")

var isValidIdentifier = require("../lib/util").isValidIdentifier;

var test_account_data = { wallet: "test data", something: { subthing: { hi: "hello!"}}}
var test_account_data_2 = { wallet: "test data", something: { subthing: { hi: "hello!"}}}

var password = "password"

test("Create new Account & Load (no email)", async (done) => {
	var adapter = new LocalStorageAdapter(undefined, password)

	var id = await adapter.create(test_account_data)

	test_account_data.identifier = id;

	var adapter2 = new LocalStorageAdapter(id, password)

	var account_data = await adapter2.load()

	test_account_data.shared_key = account_data.shared_key;

	expect(account_data).toEqual(test_account_data);
	expect(isValidIdentifier(account_data.identifier)).toBe(true);

	test_account_data.wallet = { bitcoin: "test-key" }

	var saved_data = await adapter2.save(test_account_data)
	var saved_account_data = await adapter2.load()

	expect(saved_account_data).toEqual(test_account_data)

	done()
})

test("Create new Account & Load (email)", async (done) => {
	var adapter = new LocalStorageAdapter(undefined, password)

	var id = await adapter.create(test_account_data_2, "test@example.com")
	test_account_data_2.identifier = id;

	var adapter2 = new LocalStorageAdapter("test@example.com", password)

	var account_data = await adapter2.load()

	test_account_data_2.shared_key = account_data.shared_key;
	test_account_data_2.email = account_data.email;

	expect(account_data).toEqual(test_account_data_2);
	expect(isValidIdentifier(account_data.identifier)).toBe(true);

	test_account_data_2.wallet = { litecoin: "test-key" }

	var saved_data = await adapter2.save(test_account_data_2)
	var saved_account_data = await adapter2.load()

	expect(saved_account_data).toEqual(test_account_data_2)

	done()
})