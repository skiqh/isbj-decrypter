import CryptoJS from 'crypto-js';

export async function decryptFileToBlob(password: string, file: File) {
	const keyHex = (password + ' '.repeat(24)).substring(0, 24).split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
	console.log(keyHex);
	const keyWords = CryptoJS.enc.Hex.parse(keyHex);

	const arrayBuffer = await file.arrayBuffer();
	const byteArray = new Uint8Array(arrayBuffer);

	// Convert byte array to hex string
	const encryptedHex = Array.from(byteArray)
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');

	const encryptedWords = CryptoJS.enc.Hex.parse(encryptedHex);

	const decrypted = CryptoJS.TripleDES.decrypt(
		// @ts-expect-error works anyway
		{ ciphertext: encryptedWords },
		keyWords,
		{
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.NoPadding
		}
	);

	// Convert decrypted WordArray to Uint8Array
	const decryptedBytes = [];
	for (let i = 0; i < decrypted.sigBytes; i++) {
		const byte = (decrypted.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff;
		decryptedBytes.push(byte);
	}

	const decryptedUint8Array = new Uint8Array(decryptedBytes);
	return new Blob([decryptedUint8Array], { type: 'application/octet-stream' });
}
