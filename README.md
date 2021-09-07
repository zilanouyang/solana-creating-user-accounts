# Solana Creating User Accounts Tutorial

Step by step on how to create an user account, recover user account with mnemonic with, and how to write CID hash into solana user account

## Instructions
### Create payer account to pay for all the transactions
#### 1. Creating one payer account on devnet (will be used to pay for all the transactions and assign rent to user account)
![alt creatingPayerAccount](https://github.com/zilanouyang/solana-creating-user-accounts/blob/main/assets/createPayerAccount.png)

#### 2. Functions
```javaScript
export const CreatePayAccount = async(connection) => {
    //Airdrop Amount
    const lamports = 10000000;
    // Generate key pair for payer account
    const payerKey = Keypair.generate();
    // Sign transaction of request airdrop
    const signature = await connection.requestAirdrop(payerKey.publicKey, lamports)
    // Confirm the transaction
    const tx = await connection.confirmTransaction(signature);
    let accountinfo = await connection.getAccountInfo(payerKey.publicKey);
    console.log(accountinfo);
    console.log(tx);
    return payerKey;
}
```

### Create user account with seed (mnemonic)
#### 1. Create user account:
![alt createUserAccount](https://github.com/zilanouyang/solana-creating-user-accounts/blob/main/assets/createUserAccountWithSeed.png)
#### 2. Function
```javaScript
export const CreateUserAccount = async(CID, connection, payer) => {
    let userCredentials = {};
    // Generate mnemonic for creating new account
    const mnemonic = bip39.generateMnemonic();
    // Generate seed from newly generated mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32)//.then(result => result);
    // Generate key pair from the seed
    const userKeyPair = Keypair.fromSeed(seed);
    
    userCredentials.publicKey = userKeyPair.publicKey.toString();
    userCredentials.secretKey = userKeyPair.secretKey.toString();
    userCredentials.seed = seed;
    userCredentials.mnemonic = mnemonic;
    // Get the size of CID 
    const dataSize = Buffer.from(CID).length;
    // Get the fee calculator
    const {feeCalculator} = await connection.getRecentBlockhash();
    let fees = 0;
    // Calculate the rent based on the data size
    fees += await connection.getMinimumBalanceForRentExemption(dataSize);
    // Add the rent to the approximate transaction fee
    fees += feeCalculator.lamportsPerSignature * 100; 
    // Assign newly created user account to program
    const txParams = {
        fromPubkey: payer.publicKey,
        lamports: fees,
        newAccountPubkey: userKeyPair.publicKey,
        programId: new PublicKey(PROGRAM_ID),
        space: dataSize
    }
    // Add to the transaction 
    const transaction = new Transaction().add(
        SystemProgram.createAccount(txParams)
        //SystemProgram.assign({accountPubkey : userKeyPair.publicKey, programId: new PublicKey(PROGRAM_ID)}),
    );
    // Sign and confirm the transaction
    const tx = await sendAndConfirmTransaction(connection, transaction, [payer, userKeyPair]);
    return userCredentials;
}
```
### Recover account from seed (mnemonic)
#### 1. Recover user account:
![alt recoverUserAccount](https://github.com/zilanouyang/solana-creating-user-accounts/blob/main/assets/recoverAccountWithSeed.png)
#### 2. Function
```javaScript
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
```
### Write CID data to user account
#### 1. Write CID to user account:
![alt recoverUserAccount](https://github.com/zilanouyang/solana-creating-user-accounts/blob/main/assets/writeCIDintoUserAccount.png)
#### 2. Function
```javaScript
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
```

### Get CID data from user account
#### 1. Get CID data from user account:
![alt getCID](https://github.com/zilanouyang/solana-creating-user-accounts/blob/main/assets/getDataFromAccount.png)
#### 2. Function
```javaScript
export const GetAccountData = async(userKey, connection) => {
    // Pass the user account pub key
    let pubKey = new PublicKey(userKey)
    // Get the data inside of account 
    let accountInfo = await connection.getAccountInfo(pubKey);
    // Get the value of the data 
    const data = accountInfo.data.toString();
    return data
}
```

