import 'dotenv/config';

import {
	mintTo,
	getMint,
	createMint,
	createMultisig,
	getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import { clusterApiUrl, Connection, Keypair } from '@solana/web3.js';

const payerPrivateKey = process.env['SECRET_KEY'];

const signer1 = Keypair.generate();
const signer2 = Keypair.generate();
const signer3 = Keypair.generate();

const payerKeypair = Keypair.fromSecretKey(
	new Uint8Array(JSON.parse(payerPrivateKey)),
);

const connection = new Connection(clusterApiUrl('devnet'));

const multisigPubkey = await createMultisig(
	connection,
	payerKeypair,
	[signer1.publicKey, signer2.publicKey, signer3.publicKey],
	2,
);

console.log(`Multisig: ${multisigPubkey.toBase58()}`);

const mint = await createMint(
	connection,
	payerKeypair,
	multisigPubkey,
	multisigPubkey,
	9,
);

console.log(`Mint: ${mint.toBase58()}`);

const ata = await getOrCreateAssociatedTokenAccount(
	connection,
	payerKeypair,
	mint,
	signer1.publicKey,
);

await mintTo(connection, payerKeypair, mint, ata.address, multisigPubkey, 1, [
	signer1,
	signer2,
]);

const mintInfo = await getMint(connection, mint);

console.log(`Minted: ${mintInfo.supply}`);
