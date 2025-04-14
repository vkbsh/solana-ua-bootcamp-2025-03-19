import 'dotenv/config';
import {
	Keypair,
	PublicKey,
	Connection,
	Transaction,
	clusterApiUrl,
	SystemProgram,
	LAMPORTS_PER_SOL,
	TransactionInstruction,
	sendAndConfirmTransaction,
} from '@solana/web3.js';

const memoProgram = new PublicKey(
	'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
);

const memoText = 'Memo test!!!!!';

const SECRET_KEY = 'SECRET_KEY';
const privateKey = process.env[SECRET_KEY];

if (privateKey === undefined) {
	console.log(`Add ${SECRET_KEY} to .env!`);
	process.exit(1);
}

const connection = new Connection(clusterApiUrl('devnet'));

const signer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
const recipient = new PublicKey('kbshAfYTZfF95J3bqsy34m4F4Kac1EHDPYBXsWt8YQX');
const amount = 0.01 * LAMPORTS_PER_SOL;

const tx = new Transaction().add(
	SystemProgram.transfer({
		fromPubkey: signer.publicKey,
		toPubkey: recipient,
		lamports: amount,
	}),
	new TransactionInstruction({
		keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: true }],
		data: Buffer.from(memoText, 'utf-8'),
		programId: memoProgram,
	}),
);

console.log(`Signer: ${signer.publicKey.toBase58()}`);
console.log(`Recipient: ${recipient.toBase58()}`);
console.log(`Amount: ${amount / LAMPORTS_PER_SOL} SOL`);
console.log(`Memo: ${memoText}`);

tx.feePayer = signer.publicKey;
tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

const signature = await sendAndConfirmTransaction(connection, tx, [signer]);

console.log(`Transaction: ${signature}`);
