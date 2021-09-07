import * as bip39 from "bip39"
import {Keypair, SystemProgram, Transaction, sendAndConfirmTransaction, PublicKey} from '@solana/web3.js';

const userRegistrationInfo = {
    phoneNumber: '416-123-4567',
    profilePic: 'base64',
    userName: 'Test_User',
    UserID: 'U123'
}
const PROGRAM_ID = 'HqqGdvPKWyumQY7dsrgeZavsR5i7BK6xHB9LUFKPhexy';

export const CreateBaseAccount = async() => {
    const baseAccount = Keypair.generate();
    return baseAccount;
}
export const CreatePayAccount = async(connection) => {
    const lamports = 10000000;
    // const connection = Connection;
    const payerKey = Keypair.generate();
    const signature = await connection.requestAirdrop(payerKey.publicKey, lamports)
    const tx = await connection.confirmTransaction(signature);
    let accountinfo = await connection.getAccountInfo(payerKey.publicKey);
    console.log(accountinfo);
    console.log(tx);
    return payerKey;
}

export const CreateUserAccount = async(CID, connection, payer) => {
    let userCredentials = {};
    const mnemonic = bip39.generateMnemonic();

    const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32)//.then(result => result);
    const userKeyPair = Keypair.fromSeed(seed);
    
    userCredentials.publicKey = userKeyPair.publicKey.toString();
    userCredentials.secretKey = userKeyPair.secretKey.toString();
    userCredentials.seed = seed;
    userCredentials.mnemonic = mnemonic;
    const dataSize = Buffer.from(CID).length;
    const {feeCalculator} = await connection.getRecentBlockhash();
    let fees = 0;
    fees += await connection.getMinimumBalanceForRentExemption(dataSize);
    fees += feeCalculator.lamportsPerSignature * 100; 
    // Assign newly created user account to program
    const txParams = {
        fromPubkey: payer.publicKey,
        lamports: fees,
        newAccountPubkey: userKeyPair.publicKey,
        programId: new PublicKey(PROGRAM_ID),
        space: dataSize
    }
    const transaction = new Transaction().add(
        SystemProgram.createAccount(txParams)
        //SystemProgram.assign({accountPubkey : userKeyPair.publicKey, programId: new PublicKey(PROGRAM_ID)}),
    );
    const tx = await sendAndConfirmTransaction(connection, transaction, [payer, userKeyPair]);
    return userCredentials;
}
export const RecoverAccountFromMnemonic = async(mnemonic, connection) => {
    //Get seed from imput mnemonic phrase
    const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
    // Recover account from seed
    const recoveredAcct = Keypair.fromSeed(seed);
    const pubKey = recoveredAcct.publicKey.toString();
    let accountinfo = await connection.getAccountInfo(recoveredAcct.publicKey);
    console.log(accountinfo);
    return pubKey
}
// AccountInfo<T>: { data: T; executable: boolean; lamports: number; owner: PublicKey }
export const GetAccountData = async(userKey, connection) => {
    // Pass the user account pub key
    let pubKey = new PublicKey(userKey)
    // Get the data inside of account 
    let accountInfo = await connection.getAccountInfo(pubKey);
    // Get the value of the data 
    const data = accountInfo.data.toString();
    return data
}
