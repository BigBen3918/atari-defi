import React, {useEffect, useState} from 'react';
import {Radio, Grid} from '@material-ui/core';
import {usdtContract,atariContract,wethContract,stakeContract, pairEthAtari, pairEthUsdt, stakeAddress} from './abi/contracts';

import { Alert } from 'react-bootstrap';
import { ethers } from 'ethers';

function StakeCard(){
    const [flag1, setFlag1] = useState(true);
    const [step, setStep] = useState("0");
    const [stepValue, setStepValue] = useState("5");
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
    const [balance2,setBalance2]=useState(0);

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

   const getAmoutIn=(amountout,reverseIn,reversOut)=>{
       console.log(poolEth,poolAtari,poolEth1,poolUsdt);
       if(amountout<0|| amountout>=Number(reversOut) )
           {
            console.log("reversOut",amountout,reversOut);
               return 0;
            }
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

               var lockDate = new Date(); // Epoch
               lockDate.setSeconds(lock);
               setLockTime(lockDate.toUTCString());

               setBalance(ethers.utils.formatUnits(await AtariContract.balanceOf(UserAddress),atariDecimals).slice(0,15));
               
               //user balance
                   setBalance1((ethers.utils.formatUnits(await provider.getBalance(UserAddress))).slice(0,15));
                   setBalance2(ethers.utils.formatUnits(await UsdtContract.balanceOf(UserAddress),6).slice(0,15));


               //update pool data
               console.log("update")
               var poolEth = ethers.utils.formatUnits(await WethContract.balanceOf(pairEthAtari));
               setPoolEth(poolEth);

               var poolAtari = ethers.utils.formatUnits(await AtariContract.balanceOf(pairEthAtari),0);
               setPoolAtari(poolAtari);

               var poolEth1 =ethers.utils.formatUnits(await WethContract.balanceOf(pairEthUsdt));
               setPoolEth1(poolEth1);

               var poolUsdt =ethers.utils.formatUnits(await UsdtContract.balanceOf(pairEthUsdt),6);
               setPoolUsdt(poolUsdt);

           }
       }
   },[payStep,connect])

   // check price
   useEffect( async()=>{
       if(amount>0){
           if(payStep=="1"){
               console.log("www",amount,"www",poolEth,"www",poolAtari)
               var amountIn = getAmoutIn(amount,poolEth,poolAtari);
               console.log(amountIn)
               setReturnValue(amountIn.toFixed(6));
           }
           else {
               //Busd
               var amountIn1 = getAmoutIn(amount,poolEth,poolAtari);
               var amountIn = getAmoutIn(amountIn1,poolUsdt,poolEth1);
               
               console.log(amountIn)
               
               setReturnValue(amountIn.toFixed(6));
           }
       }
   })

   const handleBuy = async () =>{
       if(connect)
        if(!isNaN(returnValue)){
            if(amount==0){
                alert("amount must be greater than zero");
            }
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
                               window.location.reload();
                           }
                               
                       }
                       else {
                           console.log('usdt')
                           //usdt , first approve
                           const provider = new ethers.providers.Web3Provider(window.ethereum);
                           const signer = provider.getSigner();
                           var UserAddress = signer.getAddress();

                           var UsdtContract = usdtContract.connect(signer);
                           var allowance =await UsdtContract.allowance(UserAddress,stakeAddress);

                           var buyamount = returnValue;

                           //check allowance balance
                           if(ethers.utils.formatUnits(allowance,6) == 0){
                                var tx= await UsdtContract.approve(stakeAddress,ethers.utils.parseUnits(Number(buyamount).toFixed(6).toString(),6))
                                .catch((err)=>{
                                    console.log(err);
                                    setLoading(false);
                                });;
    
                                if(tx!=null){
                                    await  provider.waitForTransaction(tx.hash)
                                    .catch((err)=>{
                                        setLoading(false);
                                    });
                                }
                           }
                           else if(ethers.utils.formatUnits(allowance,6)<returnValue){
                               console.log(buyamount);
                                buyamount = ethers.utils.formatUnits(allowance,6);
                                
                               console.log("use allowance balance",buyamount);
                           }
                           else {
                            console.log("use balance",buyamount);
                           }


                           var StakeContract = stakeContract.connect(signer);
                           if(stepValue!=5)
                                tx= await StakeContract.buyforstakingwithexactUsdtforToken(ethers.utils.parseUnits(Number(buyamount).toFixed(6).toString(),6),stepValue)
                                .catch((err)=>{
                                    console.log(Number(buyamount).toFixed(6).toString(),err);
                                    setLoading(false);
                                });
                            else 
                                tx= await StakeContract.buyforUsdt(ethers.utils.parseUnits(Number(buyamount).toFixed(6).toString(),6))
                                .catch((err)=>{
                                    console.log(Number(buyamount).toFixed(6),err);
                                    setLoading(false);
                                });

                           if(tx!=null){
                               await  provider.waitForTransaction(tx.hash)
                               .catch((err)=>{
                                   setLoading(false);
                               });
                               setLoading(false);
                               window.location.reload();   
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
   }

   const handleWithdraw = async () =>{
       if(!isNaN(returnValue))
       if(Date.parse(lockTime)<=0){
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
    function commafy( num ) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
     }
    return(
        <div className = "">
        {stakeState==0?(
            <div>
                <Grid container spacing = {3}>
                    <Grid item xs = {12} sm = {12} md = {6}>
                        <div className = "y-card-form-top">
                            <div className = "x-font3_2 text-center top_section" >
                                <span>AVAILABLE BALANCE</span>
                                <img src="/img/i_1.png"></img>
                            </div>
                            <div style={{padding:20}}>
                                <div className = "mt-3 bottom_border">
                                    <span className = "x-font3_1">
                                        Available ETH balance:
                                    </span>
                                    <span className = "y-card-input">{balance1}</span>
                                </div>
                                <div className = "mt-3 bottom_border">
                                    <span className = "x-font3_1">
                                        Available USDT balance:
                                    </span>
                                    <span className = "y-card-input">{balance2}</span>
                                </div>
                                <div className = "mt-3 bottom_border">
                                    <span className = "x-font3_1">
                                        Available ATRI balance:
                                    </span>
                                    <span className = "y-card-input">{balance}</span>
                                </div>
                            </div>
                           
                        </div>
                    </Grid>
                    <Grid item xs = {12} sm = {12} md = {6}>
                        <div className = "y-card-form-top">
                            <div className = "x-font3_2 text-center top_section" >
                                <span>YOUR TRANSACTION</span>
                                <img src="/img/i_2.png"></img>
                            </div>
                            <div style={{padding:20}}>
                                <div className = "mt-3 bottom_border">
                                    <span className = "x-font3_1">
                                        Amount in ATRI:
                                    </span>
                                    <input className = "y-card-input" style={{textAlign:'right'}} onChange = {handleAmount} value = {amount}/>
                                </div>
                                <div className = "mt-3 bottom_border">
                                    <span className = "x-font3_1">
                                        Payment method:
                                    </span>
                                    <div  className = 'float-right' style={{marginTop:-7}}>
                                        <span>
                                            <Radio
                                                checked={payStep=="1"}
                                                onChange={(e)=>handlePayStep(e,"1")}
                                                name="radio-button-demo"
                                                color = "primary"
                                                inputProps={{ 'aria-label': 'A' }}
                                            />
                                            <span className = "x-font4">ETH</span>
                                            <Radio
                                                checked={payStep=="2"}
                                                onChange={(e)=>handlePayStep(e,"2")}
                                                name="radio-button-demo"
                                                color = "primary"
                                                inputProps={{ 'aria-label': 'A' }}
                                            />
                                            <span className = "x-font4">USDT</span>
                                        </span>
                                
                                    </div>
                                   </div>
                                <div className = "mt-3 bottom_border">
                                    <span className = "x-font3_1">
                                        Amount in crypto:
                                    </span>
                                    <span className = "x-font3 float-right">
                                        {`${returnValue}`} <span style={{color:'#e31e2d'}}> {payStep=="1"?"ETH":"USDT"}</span>
                                    </span>
                                </div>
                            </div>
                            
                        </div>
                    </Grid>
                </Grid>
               
                <div className="y-card-form-top1">
                    <div className = "x-font3_2 text-center top_section" >
                        <span>SELECT YOUR LOCKING PERIOD</span>
                        <img src="/img/i_3.png"></img>

                    </div>
                    <Grid container spacing = {3} className = "bottom_border1">
                        <Grid item xs = {12} sm = {12} md = {6} className = "">
                        <Radio
                            checked={step=="0"}
                            onChange={(e)=>handleStep(e,"0")}
                            name="radio-button-demo"
                            color = "primary"
                            inputProps={{ 'aria-label': 'A' }}
                        />
                        <span className = "x-font3_1 pl-10"> Buy unlocked ATRI </span>
                        </Grid>
                        <Grid item xs = {12} sm = {12} md = {6} className = "text-right">
                            <span className = "x-font3_1">You will receive {commafy(amount)} ATRI</span>
                        </Grid>
                    </Grid>
                    <Grid container spacing = {3} className = "bottom_border1">
                        <Grid item xs = {12} sm = {12} md = {6} className = "">
                        <Radio
                            checked={step=="1"}
                            onChange={(e)=>handleStep(e,"1")}
                            name="radio-button-demo"
                            color = "primary"
                            inputProps={{ 'aria-label': 'A' }}
                        />
                        <span className = "x-font3_1 pl-10"> Lockup 1 month </span>
                        </Grid>
                        <Grid item xs = {12} sm = {12} md = {6} className = "text-right">
                            <span className = "x-font3_1">You will receive {commafy(parseFloat((amount*1.01).toFixed(0)))} ATRI</span>
                        </Grid>
                    </Grid>
                    <Grid container spacing = {3} className = "bottom_border1">
                        <Grid item xs = {12} sm = {12} md = {6} className = "">
                        <Radio
                            checked={step=="5"}
                            onChange={(e)=>handleStep(e,"5")}
                            name="radio-button-demo"
                            color = "primary"
                            inputProps={{ 'aria-label': 'A' }}
                        />
                        <span className = "x-font3_1 pl-10"> Lockup 3 months </span>
                        </Grid>
                        <Grid item xs = {12} sm = {12} md = {6} className = "text-right">
                            <span className = "x-font3_1">You will receive {commafy(parseFloat((amount*1.05).toFixed(0)))} ATRI</span>
                        </Grid>
                    </Grid>
                    <Grid container spacing = {3} className = "bottom_border1">
                        <Grid item xs = {12} sm = {12} md = {6} className = "">
                        <Radio
                            checked={step=="12"}
                            onChange={(e)=>handleStep(e,"12")}
                            name="radio-button-demo"
                            color = "primary"
                            inputProps={{ 'aria-label': 'A' }}
                        />
                        <span className = "x-font3_1 pl-10"> Lockup 6 months </span>
                        </Grid>
                        <Grid item xs = {12} sm = {12} md = {6} className = "text-right">
                            <span className = "x-font3_1">You will receive {commafy(parseFloat((amount*1.12).toFixed(0)))} ATRI</span>
                        </Grid>
                    </Grid>
                    <Grid container spacing = {3} className = "">
                        <Grid item xs = {12} sm = {12} md = {6} className = "">
                        <Radio
                            checked={step=="30"}
                            onChange={(e)=>handleStep(e,"30")}
                            name="radio-button-demo"
                            color = "primary"
                            inputProps={{ 'aria-label': 'A' }}
                        />
                        <span className = "x-font3_1 pl-10"> Lockup 12 months </span>
                        </Grid>
                        <Grid item xs = {12} sm = {12} md = {6} className = "text-right">
                            <span className = "x-font3_1">You will receive {commafy(parseFloat((amount*1.3).toFixed(0)))} ATRI</span>
                        </Grid>
                    </Grid>
                    <div className = "mt-1 text-center">
                        <button className = "x-swapCard-submit-button" style={{padding:14, width:'80%'}} onClick = {handleBuy}>{loadingStake?<img src = "/img/box.gif" />:"BUY"}</button>
                    </div>
                </div>
                
            </div>
            ):
            (
                <div className = "widthdraw-container">
                    <Grid container >
                    <Grid item xs = {12} sm = {12} md = {2}></Grid>
                        <Grid item xs = {12} sm = {12} md = {8}>
                         <div className = "y-card-form-top">
                            <div className = "x-font5 text-center top_section" >
                                <span> {`Please revisit on the ${lockTime}`}</span>
                                <img src="/img/i_3.png"></img>
                            </div>
                            <div className = "y-card-form-body">
                                <div className = "x-font5-2 text-center">
                                    {`you will receive ${stakeState} ATRI in ${lockTime} exactly!`}
                                </div>
                                <div className = "x-font5-2 text-center " >
                                    In order to stake or buy more please change your MM account
                                </div>
                                <div className = "mt-5 text-center">
                                    <button className = "x-swapCard-submit-button" onClick = {handleWithdraw}>{loadingWithdraw?<img src = "/img/box.gif" />:Date.parse(lockTime)>0?"Locked":"withdraw"}</button>
                                </div>
                            </div>
                        </div>
                        </Grid>
                    
                    <Grid item xs = {12} sm = {12} md = {2}></Grid>
                    </Grid>
                </div>
            )
        }
        </div>
    )
}

export default StakeCard;