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
    const programId = 'Ev6nT6UZwpjNJt6WsUC3HRMAQoMWShRFTL5kDWwY1T1Y';
    // Get public key of the program
    const programPubKey = new PublicKey(programId);
    // Convert CID to text buffer
    const textBuffer = Buffer.from(CID);
    console.log(textBuffer)
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
    const userBal = await connection.getBalance(userAccount.publicKey);
    const payerBal = await connection.getBalance(payerAccount.publicKey);
    console.log('user bal: ' + userBal);
    console.log('payerBal bal: ' + payerBal);
    // const userAccountInfo = await connection.getConfirmedTransaction(tx, 'succuess');
    // console.log(userAccountInfo)
    return tx
}
