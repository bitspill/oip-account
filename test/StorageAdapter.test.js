let StorageAdapter = require("../src/StorageAdapters/StorageAdapter")
let { InvalidPassword } = require("../src/Errors")

let encrypted_string;
let test_encrypt_password = "password"
let test_encrypt_data = { wallet: "test data", something: { subthing: { hi: "hello!"}}}

test("should encrypt", () => {
	let adapter = new StorageAdapter(undefined, test_encrypt_password);

	encrypted_string = adapter.encrypt(test_encrypt_data)

	expect(encrypted_string).toBeDefined()
})

test("should decrypt", () => {
	let adapter = new StorageAdapter(undefined, test_encrypt_password);

	let decrypted_data = adapter.decrypt(encrypted_string)

	expect(decrypted_data).toEqual(test_encrypt_data)
})

test("should NOT decrypt", () => {
	let adapter = new StorageAdapter(undefined, undefined);

	let decrypted_data, decrypt_error
	try {
		decrypted_data = adapter.decrypt(encrypted_string)
	} catch (e){
		decrypt_error = e
	}

	expect(decrypted_data).toBeUndefined()
	expect(decrypt_error instanceof InvalidPassword).toBe(true)
})