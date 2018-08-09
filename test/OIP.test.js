import { Artifact, ArtifactFile } from 'oip-index'
import { Wallet } from 'oip-hdmw'
import OIP from "../src/OIP";

test("Publish single tx Artifact", async (done) => {
	let wallet = new Wallet('00000000000000000000000000000000', {
		discover: false,
		supported_coins: ["flo_testnet"]
	})

	let address = wallet.getCoin('flo_testnet').getMainAddress()

	let artifact = new Artifact()
	artifact.setMainAddress(address.getPublicAddress())
	artifact.setTitle("oip-account test")
	artifact.setDescription("Required Description!")
	artifact.setType("Image")
	artifact.setLocation("QmQh7uTC5YSinJG2FgWLrd8MYSNtr8G5JGAckR5ARwmyET")

	let file = new ArtifactFile()
	file.setType("Image")
	file.setFilename("lhuWVA00Vn.png")
	file.setFilesize(23591)

	artifact.addFile(file)

	let broadcaster = new OIP(wallet, address)

	let txids = await broadcaster.publish(artifact)
	console.log(txids)
	expect(txids).toBeDefined()
	done()
})

/*
test("Publish Multipart Artifact", async (done) => {
	let wallet = new Wallet('00000000000000000000000000000000', {
		discover: false,
		supported_coins: ["flo_testnet"]
	})

	let address = wallet.getCoin('flo_testnet').getMainAddress()

	let artifact = new Artifact()
	artifact.setMainAddress(address.getPublicAddress())
	artifact.setTitle("oip-account test")
	artifact.setDescription("Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact. Super long description to make this a multipart artifact.")
	artifact.setType("Image")
	artifact.setLocation("QmQh7uTC5YSinJG2FgWLrd8MYSNtr8G5JGAckR5ARwmyET")

	let file = new ArtifactFile()
	file.setType("Image")
	file.setFilename("lhuWVA00Vn.png")
	file.setFilesize(23591)

	artifact.addFile(file)

	let broadcaster = new OIP(wallet, address)

	let txids = await broadcaster.publish(artifact)
	console.log(txids)
	expect(txids).toBeDefined()
	done()
})
*/