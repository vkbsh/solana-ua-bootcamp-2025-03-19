import 'dotenv/config';
import { Keypair, clusterApiUrl, Connection } from '@solana/web3.js';
import { createMint } from '@solana/spl-token';

const SECRET_KEY = 'SECRET_KEY';
const privateKey = process.env[SECRET_KEY];

if (privateKey === undefined) {
	console.log(`Add ${SECRET_KEY} to .env!`);
	process.exit(1);
}

const connection = new Connection(clusterApiUrl('devnet'));

const signer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));

const tokenMint = await createMint(
	connection,
	signer,
	signer.publicKey,
	null,
	2,
);

console.log(`Token Mint: ${tokenMint.toBase58()}`);
