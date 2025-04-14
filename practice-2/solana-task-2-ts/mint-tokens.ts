import 'dotenv/config';
import { mintTo } from '@solana/spl-token';
import { Keypair, PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';

const tokenMint = new PublicKey('8FnWaniphsmh4rVkxsgHXVX4djZQxoxbhowewoNFHheq');
const recipientAta = new PublicKey(
	'DAUmaKDKUmSQsuaTfpEZnF29AWfFT19zfKdoPXBQb5ht',
);

const SECRET_KEY = 'SECRET_KEY';
const privateKey = process.env[SECRET_KEY];

if (privateKey === undefined) {
	console.log(`Add ${SECRET_KEY} to .env!`);
	process.exit(1);
}

const MINOR_UNIT = 10 ** 2;
const connection = new Connection(clusterApiUrl('devnet'));
const signer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));

const signature = await mintTo(
	connection,
	signer,
	tokenMint,
	recipientAta,
	signer,
	10 * MINOR_UNIT,
);

console.log('Mint signature: ', signature);
