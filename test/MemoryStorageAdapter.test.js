var MemoryStorageAdapter = require("../src/MemoryStorageAdapter")

var isValidIdentifier = require("../src/util").isValidIdentifier;

var test_account_data = { wallet: "test data", something: { subthing: { hi: "hello!"}}}
var test_account_data_2 = { wallet: "test data", something: { subthing: { hi: "hello!"}}}

var password = "password"

test("Create new Account & Load", async (done) => {
	var adapter = new MemoryStorageAdapter(undefined, undefined, password)

	var account_data = await adapter.create(test_account_data)

	test_account_data.identifier = account_data.identifier;

	expect(account_data).toEqual(test_account_data);
	expect(isValidIdentifier(account_data.identifier)).toBe(true);

	var account_data_2 = await adapter.load()

	expect(account_data_2).toEqual(test_account_data)

	test_account_data.wallet = { litecoin: "test-key" }

	var saved_data = await adapter.save(test_account_data)

	expect(saved_data).toEqual(test_account_data)

	done()
})
