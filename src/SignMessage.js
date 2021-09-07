import * as bip39 from "bip39"
import {Keypair, Transaction, sendAndConfirmTransaction, PublicKey, TransactionInstruction, SystemProgram} from '@solana/web3.js';
const userRegistrationInfo = {
    phoneNumber: '416-123-4567',
    profilePic: 'base64',
    userName: 'Test_User',
    UserID: 'U123'
}
export const InitiateAccountFromMnemonic = async(mnemonic) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
    const account = Keypair.fromSeed(seed);
    return account;
}

export const CheckCID = async(mnemonic, CID, connection, payerAccount) => {
    const userAccount = await InitiateAccountFromMnemonic(mnemonic);
    const transaction = new Transaction();
    // Deployed program hash for writing data to user account
    const programId = 'HqqGdvPKWyumQY7dsrgeZavsR5i7BK6xHB9LUFKPhexy';
    // Get public key of the program
    const programPubKey = new PublicKey(programId);
    // Convert CID to text buffer
    const textBuffer = Buffer.from(CID);
    // Call program function to write data to that specific account
    const instruction = new TransactionInstruction({
        data: textBuffer, // CID buffer
        // Keys for payer account and user account
        keys: [{isSigner: true, isWritable: true, pubkey: payerAccount.publicKey }, 
            {isSigner: true, isWritable: true, pubkey: userAccount.publicKey }],
        programId: programPubKey,
    })
    // Add to transaction
    transaction.add(instruction);
    // Send and confirm transaction
    const tx = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payerAccount, userAccount]
      );
    const userAccountInfo = await connection.getParsedAccountInfo(userAccount.publicKey, 'succuess');
    return tx
}
