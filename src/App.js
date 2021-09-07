import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button'
import './App.css';
import {Connection} from '@solana/web3.js';
import {CreateBaseAccount, CreatePayAccount, CreateUserAccount, RecoverAccountFromMnemonic, GetAccountData } from './CreateAccount';
import {CheckCID} from './SignMessage'
const rpcUrl = "https://api.devnet.solana.com"

function App() {
  const [baseAccount, setBaseAccount] = useState('');
  const [payAccount, setPayAccount] = useState('');
  const [payer, setPayer] = useState('');
  const [userAccount, setUserAccount] = useState('');
  const [recoveredPubKey, setRecoveredPubKey] = useState('');
  const [CID, setCID] = useState('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
  const [acctCheck, setAcctCheck] = useState('');
  const [seedPhrase, setSeephrase] = useState('');
  const [retrievedCID, setRetrievedCID] = useState('');
  let CONNECTION = new Connection(rpcUrl);
  //console.log('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'.length)
  const handleCreatingBaseAccount = async() => {
    let base = {};
    const baseAcct = await CreateBaseAccount();
    const pubKey = baseAcct.publicKey.toString();
    const privateKey = baseAcct.secretKey.toString();
    //console.log(pubKey);
    base.pubKey = pubKey;
    base.privateKey = privateKey;
    console.log(base);
    setBaseAccount(base)
  }
  const handleCreatePayerAccount = async() => {
    let pay = {};
    const payAcct = await CreatePayAccount(CONNECTION);
    const pubKey = payAcct.publicKey.toString();
    const privateKey = payAcct.secretKey.toString();
    pay.pubKey = pubKey;
    pay.privateKey = privateKey;
    console.log(pay);
    setPayer(payAcct);
    setPayAccount(pay);
  }
  const handleCreateUserAccount = async () => {
    let user = {};
    const userAcct = await CreateUserAccount(CID, CONNECTION, payer);
    console.log(userAcct);
    user.pubKey = userAcct.publicKey
    user.privateKey = userAcct.secretKey 
    user.seed = userAcct.seed 
    user.mnemonic = userAcct.mnemonic
    setUserAccount(user);
  }
  const handleRecoverAccount = async() => {
    //console.log(userAccount.mnemonic)
    const reAcct = await RecoverAccountFromMnemonic(seedPhrase, CONNECTION);
    //console.log(reAcct);
    setRecoveredPubKey(reAcct);
  }
  const handleChange = (event) => {
    setCID(event.target.value)
    // this.setState({value: });
  }
  const handleAccountChange = (event) => {
    setAcctCheck(event.target.value)
  }
  const handleSignCIDMsg = async() => {
    const txHash = await CheckCID(userAccount.mnemonic, CID, CONNECTION, payer)
    console.log(txHash)
  }
  const handleGetDataFromAccount = async() => {
    const accountToGet = acctCheck;
    const accountInfo = await GetAccountData(accountToGet, CONNECTION);
    setRetrievedCID(accountInfo)
  }
  const handleSeedPhraseChange = (event) => {
    setSeephrase(event.target.value);
  };
  return (
    <div className="App">
      <div style={{ marginTop: '2%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <Button variant="success" onClick={() => handleCreatingBaseAccount()}>Create Base Account</Button>{' '}
        <div>Base Account: {baseAccount.pubKey}</div>
      </div>
      <div style={{ marginTop: '2%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <Button variant="success" onClick={() => handleCreatePayerAccount()}>Create Payer Account</Button>{' '}
        <div>Payer Account: {payAccount.pubKey}</div>
      </div>
      <div style={{ marginTop: '2%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <Button variant="success" onClick={() => handleCreateUserAccount()}>Create USER Account</Button>{' '}
        <div>USER PUB KEY: {userAccount.pubKey}</div>
        <div>USER SECRET KEY: {userAccount.privateKey}</div>
        <div>USER SEED: {userAccount.seed}</div>
        <div>USER MNEMONIC: {userAccount.mnemonic}</div>
      </div>
      <div style={{ marginTop: '2%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <input type="text" value={seedPhrase} onChange={handleSeedPhraseChange} />
        <Button variant="success" onClick={() => handleRecoverAccount()}>Recover USER Account</Button>{' '}
        <div>USER PUB KEY: {userAccount.pubKey}</div>
        <div>Recovered PUB KEY: {recoveredPubKey}</div>
      </div>
      <div style={{ marginTop: '2%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <div>
          <input type="text" value={CID} onChange={handleChange} />
          <div>CID: {CID}</div>
          </div>
        <Button variant="success" onClick={() => handleSignCIDMsg()}>Attach account to CID</Button>{' '}
        <div>USER PUB KEY: {userAccount.pubKey}</div>
        <div>USER MNEMONIC: {userAccount.mnemonic}</div>
      </div>
      <div style={{ marginTop: '2%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <input type="text" value={acctCheck} onChange={handleAccountChange} />
        <Button variant="success" onClick={() => handleGetDataFromAccount()}>Get Data from Account</Button>{' '}
        <div>Retrieved CID: {retrievedCID}</div>
      </div>
    </div>
  );
}

export default App;
