import React, {useEffect, useState} from 'react';
import {Radio, Grid} from '@material-ui/core';
import {usdtContract,atariContract,wethContract,stakeContract, pairEthAtari, pairEthUsdt, stakeAddress} from './abi/contracts';

import { Alert } from 'react-bootstrap';
import { ethers } from 'ethers';

function AnalogyCard(){
    const [flag1, setFlag1] = useState(true);
    const [step, setStep] = useState("1");
    const [stepValue, setStepValue] = useState("0");
    const [amount, setAmount] = useState(0);
    const [connect, setConnect] = useState(false);
    const [stakeState, setStakeState] = useState(0);
    const [lockTime, setLockTime] = useState();
    const [returnValue, setReturnValue] = useState(0);
    const [loadingStake, setLoading] = useState(false);
    const [loadingWithdraw, setLoadingWithdraw] = useState(false);
    const [screenWidth, setScreenWidth] = useState();
	const [balance,setBalance]=useState(0);
	const [balance1,setBalance1]=useState(0);

    const [atariPrice,setAtariPrice] = useState(0);
    const [usdtPrice,setUsdtPrice] = useState(0);
    const [ethPrice,setEthPrice] = useState(0);

    const [payStep,setPayStep] = useState("1");

   //atariinfo
   const [atariDecimals,setAtariDecimals] = useState(18);
   const [usdtDecimals, setUsdtDecimals] = useState(18);

   //pool info
   const [poolEth,setPoolEth] = useState(0);
   const [poolAtari,setPoolAtari] = useState(0);
   const [poolEth1,setPoolEth1] = useState(0);
   const [poolUsdt,setPoolUsdt] = useState(0);

   const [stakePoolEth,setStakePoolEth] = useState(0);
   const [stakePoolAtari,setStakePoolAtari] = useState(0);
   const [lockedAtari, setLockedAtari] = useState(0);

   const getAmoutIn=(amountout,reverseIn,reversOut)=>{
       console.log(poolEth,poolAtari,poolEth1,poolUsdt);
       if(amountout<0||amountout>=reversOut)
           return 0;
       else {
           var amountIn =amountout/(reversOut-amountout)*reverseIn;
           return amountIn;
       };
   }
   
   useEffect( async()=>{
       if(window.ethereum){
           const provider = new ethers.providers.Web3Provider(window.ethereum);
           const accounts = await provider.listAccounts();
           const chainId = await window.ethereum.request({ method: 'eth_chainId' });

           //if metamask connected to site
           if(accounts.length!=0&&chainId==1){
               
               //setConnect true
               setConnect(true);
               
               //get user
               var signer=provider.getSigner()
               const UserAddress=await signer.getAddress();

               var WethContract = wethContract.connect(signer);
               var AtariContract = atariContract.connect(signer);
               var UsdtContract = usdtContract.connect(signer);
               var StakeContract = stakeContract.connect(signer);

               //atari info
               var atariDecimals  = await AtariContract.decimals();
               setAtariDecimals(atariDecimals);

               //usdt info 
               var usdtDecimals = await UsdtContract.decimals();
               setUsdtDecimals(usdtDecimals);

               //stake info
               var stakeamount =ethers.utils.formatUnits( await StakeContract.getamount(window.ethereum.selectedAddress),atariDecimals);
               setStakeState(stakeamount);

               var lock = await StakeContract.getlocktime(UserAddress);

               var filter = StakeContract.filters.Stake();
               var data=await StakeContract.queryFilter(filter);
               console.log("data",data);

               var lockDate = new Date(); // Epoch
               lockDate.setSeconds(lock);
               setLockTime(lockDate.toUTCString());

               setBalance(ethers.utils.formatUnits(await AtariContract.balanceOf(UserAddress),atariDecimals).slice(0,15));
               
               //user balance
               if(payStep=="1")
                   setBalance1((ethers.utils.formatUnits(await provider.getBalance(UserAddress))).slice(0,15));
               else{
                   setBalance1(ethers.utils.formatUnits(await UsdtContract.balanceOf(UserAddress),16).slice(0,15));

               }


               //update pool data
               var poolEth = ethers.utils.formatUnits(await WethContract.balanceOf(pairEthAtari));
               setPoolEth(poolEth);
               
               var poolAtari = ethers.utils.formatUnits(await AtariContract.balanceOf(pairEthAtari),0);
               setPoolAtari(poolAtari);

               var poolEth1 =ethers.utils.formatUnits(await WethContract.balanceOf(pairEthUsdt));
               setPoolEth1(poolEth1);

               var poolUsdt =ethers.utils.formatUnits(await UsdtContract.balanceOf(pairEthUsdt),6);
               setPoolUsdt(poolUsdt);

               //stake pool data
               var stakePoolEth = ethers.utils.formatUnits(await provider.getBalance(stakeAddress));
               setStakePoolEth(stakePoolEth);
               var stakePoolAtari = ethers.utils.formatUnits(await AtariContract.balanceOf(stakeAddress),0);
               setStakePoolAtari(stakePoolAtari);

               var lockedAtari = ethers.utils.formatUnits(await StakeContract.lockedBalance(),0);
               setLockedAtari(lockedAtari);

           }
                   
               

       }
   })


   const handleBuy = async () =>{
       if(!isNaN(returnValue))
           setLoading(true);
           if(amount>0){
               console.log(returnValue);
               try {
                   if(connect){
                       //ether
                       if(payStep=="1"){
                           console.log("ether")
                           const provider = new ethers.providers.Web3Provider(window.ethereum);
                           const signer = provider.getSigner();
                           var StakeContract = stakeContract.connect(signer)
                           
                           var tx;
                           
                           if(stepValue==5)
                               tx = await StakeContract.buy({value:ethers.utils.parseUnits(returnValue.toString().slice(0,15))})
                               .catch((err)=>{
                                   console.log(err)
                                   setLoading(false);
                               });
                           else
                               tx= await StakeContract.buyforstakingwithexactEHTforToken(stepValue,{value:ethers.utils.parseUnits(returnValue.toString().slice(0,15))})
                               .catch((err)=>{
                                   
                                   console.log(err)
                                   setLoading(false);
                               });


                           if(tx!=null){
                               await  provider.waitForTransaction(tx.hash)
                               .catch((err)=>{
                                   setLoading(false);
                               });
                               setLoading(false);
                           }
                               
                       }
                       else {
                           console.log('usdt')
                           //usdt , first approve
                           const provider = new ethers.providers.Web3Provider(window.ethereum);
                           const signer = provider.getSigner();

                           var UsdtContract = usdtContract.connect(signer);
                           var tx= await UsdtContract.approve(stakeAddress,ethers.utils.parseUnits(returnValue.toString().slice(0,15),6))
                           .catch((err)=>{
                               setLoading(false);
                           });;

                           if(tx!=null){
                               await  provider.waitForTransaction(tx.hash)
                               .catch((err)=>{
                                   setLoading(false);
                               });
                           }

                           var StakeContract = stakeContract.connect(signer)
                           var tx= await StakeContract.buyforstakingwithexactUsdtforToken(stepValue,ethers.utils.parseUnits(returnValue.toString().slice(0,15),6),amount)
                           .catch((err)=>{
                               setLoading(false);
                           });;

                           if(tx!=null){
                               await  provider.waitForTransaction(tx.hash)
                               .catch((err)=>{
                                   setLoading(false);
                               });
                               setLoading(false);
                           }        
                       }
                   }
               }
               catch (err){
                   console.log(err)
                   setLoading(false);
               }
           }
           else{
               setLoading(false);
       }
   }

   const handleWithdraw = async () =>{
       if(!isNaN(returnValue))
       if(lockTime<=0){
           if(connect){
               setLoading(true);
               const provider = new ethers.providers.Web3Provider(window.ethereum);
               const signer = provider.getSigner();
               
               var StakeContract = stakeContract.connect(signer)
               var tx = await StakeContract.withdraw();
               
               if(tx!=null){
                   await  provider.waitForTransaction(tx.hash)
                   .catch((err)=>{
                       setLoading(false);
                   });
                   setLoading(false);
               }                       
           }
       } 
   }

   const handleStep = async (e,v) =>{
       console.log(v);
       setStep(v);
       if(v==1)
           setStepValue(0);
       else if(v==5)
           setStepValue(1);
       else if(v==12)
           setStepValue(2);
       else if(v==30)
           setStepValue(3);
           
       else setStepValue(5)
   }

    function commafy( num ) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    const handlePayStep = async (e,v) =>{
        console.log(v);
        setPayStep(v);
    }

    const handleAmount = async (e) =>{
        setAmount(e.target.value)
    }
   
    return(
        <div className = "x-swapCard-container" style = {screenWidth>800?{paddingLeft:"70px", paddingRight: "70px"}:{paddingRight: "10px", paddingLeft: "10px"}}>
        {stakeState==0?(
                <div>
                   <div style={{display:'flex',marginBottom:20}}>
                        <span className="x-font2">BUY STAKED ATRI</span>
                        <span className = "x-font3" style = {{marginLeft:'auto',alignSelf:'center'}}>Available {payStep=="1"?"ETH":"USDT"} balance: <span>{balance1}</span></span>
                    </div>
                    <div className="box_rect" style={{textAlign:'center'}}>
                       
                        
                        <Grid container>
                            <Grid item xs = {12} sm = {6} md = {6}>
                            <span className = "x-font3" style={{backgroundColor: 'rgb(26,27,31)', padding: 7,paddingLeft: 20, borderRadius: 20,
                                paddingRight: 20}}>Amount in ATRI 
                            </span>
                                <input type = "number" placeholder="0.00" style={{textAlign:'center'}} className = "x-swapForm-input" onChange = {handleAmount} value = {amount}/>
                                {/* <span>atari</span> */}
                            </Grid> 
                            <Grid item xs = {12} sm = {6} md = {6} style={{display:'flex',flexDirection:'column'}} className = "x-stake-field">
                                <span className = "x-font3" style = {{color: "white", float: "right"}}>Available ATRI balance :  <span>{commafy(balance)}</span></span>
                                
                                <div style={{margin:'auto'}}>
                                    <img src = {`/img/token/atari.png`} width = "30px"/>
                                    <span style={{paddingLeft:10}} className = "x-swapForm-token x-font3">atari</span>
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                    <div className="box_rect" style={{marginTop:30,textAlign:'center'}}>
                    <span className = "x-font3_1" style={{backgroundColor: 'rgb(26,27,31)',color:'#e31e2d !important', padding: 7,paddingLeft: 20, borderRadius: 20,
                        paddingRight: 20}}>Select the locking period</span>
                        <Grid container spacing = {3}>
                            <Grid item xs = {0} sm = {1} md = {2}></Grid>
                            <Grid item xs = {12} sm = {10} md = {8}>
                                <div style={{paddingTop:10}}>
                                    <Radio
                                        checked={step=="0"}
                                        onChange={(e)=>handleStep(e,"0")}
                                        name="radio-button-demo"
                                        color = "primary"
                                        inputProps={{ 'aria-label': 'A' }}
                                    />
                                    <span className = "x-font4"> Buy </span>

                                </div>
                                <div>
                                    <Radio
                                        checked={step=="1"}
                                        onChange={(e)=>handleStep(e,"1")}
                                        name="radio-button-demo"
                                        color = "primary"
                                        inputProps={{ 'aria-label': 'A' }}
                                    />
                                    <span className = "x-font4">1 month: <span className="x-font3_1" > 1% </span> return</span>

                                </div>
                                <div>
                                    <Radio
                                        checked={step=="5"}
                                        onChange={(e)=>handleStep(e,"5")}
                                        name="radio-button-demo"
                                        color = "primary"
                                        inputProps={{ 'aria-label': 'A' }}
                                    />
                                    <span className = "x-font4">3 month: <span className="x-font3_1" > 5% </span> return</span>

                                </div>
                                <div>
                                    <Radio
                                        checked={step=="12"}
                                        onChange={(e)=>handleStep(e,"12")}
                                        name="radio-button-demo"
                                        color = "primary"
                                        inputProps={{ 'aria-label': 'A' }}
                                    />
                                    <span className = "x-font4">6 month: <span className="x-font3_1" > 12% </span> return</span>
                                </div>
                                <div style={{paddingBottom:10}}>
                                    <Radio
                                        checked={step=="30"}
                                        onChange={(e)=>handleStep(e,"30")}
                                        name="radio-button-demo"
                                        color = "primary"
                                        inputProps={{ 'aria-label': 'A' }}
                                    />
                                    <span className = "x-font4">1 Year: <span className="x-font3_1" > 30% </span> return</span>

                                </div>
                                </Grid>
                            <Grid item xs = {0} sm = {1} md = {2}></Grid>
                        </Grid>
                        <span className = "x-font3_1" style={{backgroundColor: 'rgb(26,27,31)',color:'#e31e2d !important', padding: 7,paddingLeft: 20, borderRadius: 20,
                        paddingRight: 20}}>Select your payment mothod</span>
                        <Grid container spacing = {3}>
                        <Grid item xs = {0} sm = {1} md = {2}></Grid>
                            <Grid item xs = {12} sm = {10} md = {8}>
                                <div style={{paddintTop:10}}>
                                    <Radio
                                        checked={payStep=="1"}
                                        onChange={(e)=>handlePayStep(e,"1")}
                                        name="radio-button-demo"
                                        color = "primary"
                                        inputProps={{ 'aria-label': 'A' }}
                                    />
                                    <span className = "x-font4">ETH</span>

                                </div>
                                <div>
                                    <Radio
                                        checked={payStep=="2"}
                                        onChange={(e)=>handlePayStep(e,"2")}
                                        name="radio-button-demo"
                                        color = "primary"
                                        inputProps={{ 'aria-label': 'A' }}
                                    />
                                    <span className = "x-font4">USDT</span>
                                </div>
                                </Grid>
                                <Grid item xs = {0} sm = {1} md = {2}></Grid>
                        </Grid>
                            <div className = "x-font3 text-center mt-4">
                                {`${returnValue}`} <span style={{color:'#e31e2d'}}> {payStep=="1"?"ETH":"USDT"}</span>
                            </div>
                    </div>
                   
                    <div className = "mt-5">
                        <button className = "x-swapCard-submit-button" style={{padding:10}} onClick = {handleBuy}>{loadingStake?<img src = "/img/box.gif" />:"BUY"}</button>
                    </div>
                </div>):
                (
                    <div>
                        <div className = "x-font2 text-center">
                            {`you will receive ${stakeState} ATRI in ${lockTime} exactly!`}
                        </div>
                        <div className = "x-font2 text-center" >
                            In order to stake or buy more please change your MM account
                        </div>
                        <div className = "mt-5">
                            <button className = "x-swapCard-submit-button" onClick = {handleWithdraw}>{loadingWithdraw?<img src = "/img/box.gif" />:"withdraw"}</button>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default AnalogyCard;