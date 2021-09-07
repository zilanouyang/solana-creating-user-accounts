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
    const programId = 'HqqGdvPKWyumQY7dsrgeZavsR5i7BK6xHB9LUFKPhexy';
    // // Format CID buffer
    const programPubKey = new PublicKey(programId);
    console.log(programPubKey)
    const programKeyToString = programPubKey.toString();
    console.log(programKeyToString)
    const textBuffer = Buffer.from(CID);
    // // Sign CID data to transaction
    // transaction.sign([payerAccount, userAccount])
    console.log(userAccount)
    const instruction = new TransactionInstruction({
        data: textBuffer,
        keys: [{isSigner: true, isWritable: true, pubkey: payerAccount.publicKey }, {isSigner: true, isWritable: true, pubkey: userAccount.publicKey }],
        programId: programPubKey,
    })
    
    transaction.add(instruction);
    console.log(payerAccount)
    // //const tx = await connection.sendTransaction(userAccount, keys)
    const tx = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payerAccount, userAccount]
      );
    const userAccountInfo = await connection.getParsedAccountInfo(userAccount.publicKey, 'succuess');
    console.log(userAccountInfo)
    return tx
    // const signed_msg = connection.confirmTransaction(CID, 'success')
    // return signed_msg
}
