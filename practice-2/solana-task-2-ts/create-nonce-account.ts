import 'dotenv/config';
import {
	Keypair,
	Connection,
	Transaction,
	clusterApiUrl,
	SystemProgram,
	LAMPORTS_PER_SOL,
	NONCE_ACCOUNT_LENGTH,
	sendAndConfirmTransaction,
} from '@solana/web3.js';

const SECRET_KEY = 'SECRET_KEY';
const privateKey = process.env[SECRET_KEY];

if (privateKey === undefined) {
	console.log(`Add ${SECRET_KEY} to .env!`);
	process.exit(1);
}

const connection = new Connection(clusterApiUrl('devnet'));

const signer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
const nonceKeypair = Keypair.generate();

const tx = new Transaction().add(
	SystemProgram.createAccount({
		space: NONCE_ACCOUNT_LENGTH,
		fromPubkey: signer.publicKey,
		programId: SystemProgram.programId,
		lamports: 0.0015 * LAMPORTS_PER_SOL,
		newAccountPubkey: nonceKeypair.publicKey,
	}),
	SystemProgram.nonceInitialize({
		noncePubkey: nonceKeypair.publicKey,
		authorizedPubkey: signer.publicKey,
	}),
);

tx.feePayer = signer.publicKey;
tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

const signature = await sendAndConfirmTransaction(connection, tx, [
	signer,
	nonceKeypair,
]);

console.log(`Nonce Account: ${nonceKeypair.publicKey.toBase58()}`);
console.log(`Transaction: ${signature}`);
