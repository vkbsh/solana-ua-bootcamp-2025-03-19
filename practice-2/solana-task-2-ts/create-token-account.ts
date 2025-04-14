import 'dotenv/config';

import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { PublicKey, Connection, clusterApiUrl, Keypair } from '@solana/web3.js';

const tokenMint = new PublicKey('8FnWaniphsmh4rVkxsgHXVX4djZQxoxbhowewoNFHheq');
const recipient = new PublicKey('kbshAfYTZfF95J3bqsy34m4F4Kac1EHDPYBXsWt8YQX');

const SECRET_KEY = 'SECRET_KEY';
const privateKey = process.env[SECRET_KEY];

if (privateKey === undefined) {
	console.log(`Add ${SECRET_KEY} to .env!`);
	process.exit(1);
}

const connection = new Connection(clusterApiUrl('devnet'));
const signer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));

const tokenAccount = await getOrCreateAssociatedTokenAccount(
	connection,
	signer,
	tokenMint,
	recipient,
);

console.log(`Token Account: ${tokenAccount.address.toBase58()}`);
