import React, {useEffect, useState} from 'react';
import {Radio, Grid} from '@material-ui/core';
import {atari, atariContract,stakeContract, stakeAddress} from './abi/contracts';
import { ethers } from 'ethers';

function StakeCard(){
    const [flag1, setFlag1] = useState(true);
    const [step, setStep] = useState("1");
    const [stepValue, setStepValue] = useState("0");
    const [amount, setAmount] = useState(0);
    const [connect, setConnect] = useState(false);
    const [stakeState, setStakeState] = useState(0);
    const [lockTime, setLockTime] = useState();
    const [returnValue, setReturnValue] = useState(0);
    const [loadingStake, setLoadingStake] = useState(false);
    const [loadingWithdraw, setLoadingWithdraw] = useState(false);
    const [screenWidth, setScreenWidth] = useState();
	const [balance,setBalance]=useState(0);
    const [withdrawable, setWithdrawable] = useState(true);

    function commafy( num ) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    
    useEffect( async()=>{
        //metamask connect
		if(typeof window !== "undefined"){
			if(window.ethereum){
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const accounts = await provider.listAccounts();
            
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
			if(accounts.length==0||chainId!=1){
				setConnect(false)
			}
			else
			{
				setConnect(true)
				var signer=provider.getSigner()
				//set address
				const UserAddress=await signer.getAddress();
				
				var tokenContract=atariContract.connect(signer);
				
				setBalance(ethers.utils.formatUnits(await tokenContract.balanceOf(stakeAddresse),0).slice(0,15));
            }
			}
		}    
    })


    const handleStake = async () =>{
        if(amount>0&&connect){
            setLoading(true);
                
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                var signer=provider.getSigner()
                var AtariContract = atariContract.connect(signer);
                var tx=await AtariContract.approve(stakeAddress,amount)
                .catch((err)=>{
                    console.log(err)
                    setLoading(false);
                });
                if(tx!=null){
                    await  provider.waitForTransaction(tx.hash)
                    .catch((err)=>{
                        setLoading(false);
                    });

                    //staking
                    var StakeContract = stakeContract.connect(signer);
                    var tx = await StakeContract.stake(amount,stepValue)
                    .catch((err)=>{
                        setLoading(false);
                    });
                    if(tx!=null){
                        await  provider.waitForTransaction(tx.hash)
                        .catch((err)=>{
                            setLoading(false);
                        });                
                    } 
                }    
                
            
            setLoading(false)
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
                var tx = await StakeContract.withdraw()
                .catch((err)=>{
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
        } 
    }

    const handleStep = (e,v) =>{
        setStep(v);
        setReturnValue(Number(amount)+Number(amount*v/100));
        if(v==1)
            setStepValue(0);
        else if(v==3)
            setStepValue(1);
        else if(v==10)
            setStepValue(2);
        else
            setStepValue(3);
    }

    const handleAmount = (e) =>{
        if(e.target.value>0){
            setAmount(e.target.value)
           setReturnValue(Number(e.target.value)+Number(e.target.value*step/100))
        }
    }

    useEffect( async ()=>{
        if(typeof window !== "undefined"){
        if(window.ethereum){
                setFlag1(false)
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.listAccounts();
                
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if(accounts.length!=0&&chainId==1){
                    
                    setConnect(true);
                    
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    
                    var StakeContract = stakeContract.connect(signer)
                    var data = await StakeContract.getamount(window.ethereum.selectedAddress);
                    var lock = await StakeContract.getlocktime(window.ethereum.selectedAddress);

                    if(Number(data.toString())>0&&Number(lock.toString())>0)
                    setWithdrawable(false);
                    setStakeState(data);
                    var lockDate = new Date(); // Epoch
                    lockDate.setSeconds(lock);
                    setLockTime(lockDate.toUTCString());
                }
            }
        }
    })
  
    return(
        <div className = "x-swapCard-container" style = {screenWidth>800?{paddingLeft:"70px", paddingRight: "70px"}:{paddingRight: "20px", paddingLeft: "20px"}}>
        {stakeState==0?(
                <div>
                   
                    <div style={{display:'flex',marginBottom:20}}>
                        <span className="x-font2">Stake</span>
                        <span className="x-font3" style={{marginLeft:'auto',alignSelf:'center'}}>{connect?`Metamask Connected`:`please connect metamask`}</span>
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


                    
                    <div className="box_rect" style={{marginTop:30, textAlign:'center'}}>
                    <span className = "x-font3_1" style={{backgroundColor: 'rgb(26,27,31)',color:'#e31e2d !important', padding: 7,paddingLeft: 20, borderRadius: 20,
                        paddingRight: 20}}>Select the locking period</span>
                            <Grid container spacing = {3}>
                        <Grid item xs = {0} sm = {1} md = {2}></Grid>
                        <Grid item xs = {12} sm = {10} md = {8}>
                        <div style={{paddingTop:10}}>
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
                            <span className = "x-font4">3 months: <span className="x-font3_1" > 5% </span> return</span>
                        </div>
                        <div>
                            <Radio
                                checked={step=="12"}
                                onChange={(e)=>handleStep(e,"12")}
                                name="radio-button-demo"
                                color = "primary"
                                inputProps={{ 'aria-label': 'A' }}
                            />
                            <span className = "x-font4">6 months: <span className="x-font3_1" > 12% </span> return</span>
                        </div>
                        <div>
                            <Radio
                                checked={step=="30"}
                                onChange={(e)=>handleStep(e,"30")}
                                name="radio-button-demo"
                                color = "primary"
                                inputProps={{ 'aria-label': 'A' }}
                            />
                            <span className = "x-font4">12 months: <span className="x-font3_1" > 30% </span> return</span>
                        </div>
                        </Grid>
                        <Grid item xs = {0} sm = {1} md = {2}></Grid>
                        </Grid>
                        <div className = "x-font3 text-center mt-4">
                            {`${returnValue} atari will be returned!`}
                        </div>
                    </div>
                    
                    <div className = "mt-5">
                        <button className = "x-swapCard-submit-button" style={{padding:10}} onClick = {handleStake}>{loadingStake?<img src = "/img/box.gif" />:"Stake"}</button>
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

export default StakeCard;