var StorageAdapter = require("../src/StorageAdapter")

var encrypted_string;
var test_encrypt_password = "password"
var test_encrypt_data = { wallet: "test data", something: { subthing: { hi: "hello!"}}}

test("should encrypt", () => {
	var adapter = new StorageAdapter(undefined, test_encrypt_password);

	encrypted_string = adapter.encrypt(test_encrypt_data)

	expect(encrypted_string).toBeDefined()
})

test("should decrypt", () => {
	var adapter = new StorageAdapter(undefined, test_encrypt_password);

	var decrypted_data = adapter.decrypt(encrypted_string)

	expect(decrypted_data).toEqual(test_encrypt_data)
})

test("should NOT decrypt", () => {
	var adapter = new StorageAdapter(undefined, undefined);

	var decrypted_data = adapter.decrypt(encrypted_string)

	expect(decrypted_data).toBeUndefined()
})