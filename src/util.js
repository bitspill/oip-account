import isemail from 'isemail';

const tldBlacklist = ['mailinator.com']
function isValidEmail (email) {
	if (!email)
		return false;
	
	return isemail.validate(email, {tldBlacklist: tldBlacklist})
}

function isValidIdentifier (identifier) {
	// for example 75c1209-dbcac5a6-e040977-64a52ae
	return /^[0-9a-f]{7}-[0-9a-f]{8}-[0-9a-f]{7}-[0-9a-f]{7}$/.test(identifier)
}

function isValidSharedKey (sharedKey) {
	// for example 3944a2806982d40eab55068df19328b3f06f0bce924989099a2cfc21769cc72d91200da16b79a5c6145721e9d2543924
	return /^[0-9a-f]+$/.test(sharedKey)
}

module.exports = {
	isValidEmail,
	isValidIdentifier,
	isValidSharedKey
}