import React, {useState, useEffect} from 'react';
import SwapForm from './swapForm';
import {useRouter} from 'next/router';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import InfoIcon from '@material-ui/icons/Info';
import Web3 from 'web3';
import {web3, atari, fantom, weth,routerAddress, factoryContract, exchangeContract, atariContract, fantomContract, gasLimitHex, PairAbi} from './abi/contract';
import tokenAbi from './abi/token.json'; 
import exchangeAbi from './abi/exchange.json';
import { ethers } from 'ethers';

function LiquidityCard(){
    const router = useRouter();
    const [flag1, setFlag1] = useState(true);
    const [token1, setToken1] = useState("ETH");
    const [flag2, setFlag2] = useState(true);
    const [token2, setToken2] = useState("ETH");
    const [tokenAddress1, setTokenAddress1] = useState("0xc778417e063141139fce010982780140aa0cd5ab");
    const [tokenAddress2, setTokenAddress2] = useState("0xc778417e063141139fce010982780140aa0cd5ab");
    const [amount1, setAmount1] = useState(0);
    const [amount2, setAmount2] = useState(0);
    const [loading, setLoading] = useState(false);
    const [screenWidth, setScreenWidth] = useState();
	const [signer,setSigner]=useState();
	const [userAddress,setAddress]=useState();
	const [balance1,setBalance1]=useState(0);
	const [balance2,setBalance2]=useState(0);
	const [connect,setConnect]=useState("false");

    const [liquiditystep,setLiquidityStep]= useState("1")
    const [lpAmount,setLpAmount]= useState(0);
    const [pairAddress,setPairAddress] = useState("");
    const [removeAmount,setRemoveAmount]= useState(0);
    const [amount, setAmount] = useState(0);

    useEffect( async()=>{
        if (typeof window !== 'undefined') {
            setScreenWidth(window.innerWidth);
          }

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
            var signer=provider.getSigner()
            setSigner(signer);
            //set address
            const UserAddress=await signer.getAddress();
            setAddress(UserAddress);
            setConnect(true);
            
            var tokenContract1=new ethers.Contract(tokenAddress1,tokenAbi,signer);
            var tokenContract2=new ethers.Contract(tokenAddress2,tokenAbi,signer);
            
            if(tokenAddress1==weth)
                setBalance1((ethers.utils.formatUnits(await provider.getBalance(UserAddress))).slice(0,15));
            else 
                setBalance1(ethers.utils.formatUnits(await tokenContract1.balanceOf(UserAddress),await tokenContract1.decimals()).slice(0,15));
            
            if(tokenAddress2==weth)	
                setBalance2(ethers.utils.formatUnits(await provider.getBalance(UserAddress)).slice(0,15));
            else	
                setBalance2(ethers.utils.formatUnits(await tokenContract2.balanceOf(UserAddress),await tokenContract2.decimals()).slice(0,15));
            
            if(token1!=token2){
                var data2 = await factoryContract.methods.getPair(tokenAddress1, tokenAddress2).call();
                setPairAddress(data2);
            }
    
        }
        }
    }
    })

    const handleReverse = (e) =>{
        setToken1(token2);
        setToken2(token1);
        setTokenAddress1(tokenAddress2);
        setTokenAddress2(tokenAddress1);
    }

    const handleToken1 = (e,v) =>{
        setToken1(v);
        if(v=="Atari")
            setTokenAddress1(atari);
        if(v=="Fantom")
            setTokenAddress1(fantom);
        if(v=="ETH")
            setTokenAddress1(weth);
        setFlag1(true);
        setFlag1(true);
    }

    const handleToken2 = (e,v) =>{
        setToken2(v);
        if(v=="Atari")
            setTokenAddress2(atari);
        if(v=="Fantom")
            setTokenAddress2(fantom);
        if(v=="ETH")
            setTokenAddress2(weth);
        setFlag2(true);

    }

    const handleAmount1 = async (e)=>{
        setAmount1(e.target.value);

        if(e.target.value>0&&token1!=token2){
            console.log("I want to eat")
            var data1 = await factoryContract.methods.getPair(tokenAddress1, tokenAddress2).call();
            var pairContract = new web3.eth.Contract(PairAbi, data1);
            var pairData1 = await pairContract.methods.getReserves().call();
            var token10 = await pairContract.methods.token0().call();
            console.log("tokenAddress1", tokenAddress1, "token10", token10, "pairData0", pairData1[0], "pairData1", pairData1[1])
            if(token10.toUpperCase()==tokenAddress1.toUpperCase()){
                setAmount2((pairData1[0]/pairData1[1]*e.target.value).toFixed(10));
            }
            else{
                setAmount2((pairData1[1]/pairData1[0]*e.target.value).toFixed(10));
            }
        }
    }
    const handleAmount2 = async (e)=>{
        setAmount2(e.target.value);
      
        if(e.target.value>0&&token1!=token2){
            var data2 = await factoryContract.methods.getPair(tokenAddress1, tokenAddress2).call();
            var pairContract = new web3.eth.Contract(PairAbi, data2);
            var pairData2 = await pairContract.methods.getReserves().call();
            var token20 = await pairContract.methods.token0().call();
           
            if(token20==tokenAddress2){
                setAmount1((pairData2[0]/pairData2[1]*e.target.value).toFixed(10));
            }
            else{
                setAmount1((pairData2[1]/pairData2[0]*e.target.value).toFixed(10));
            }
        }
    }

    const handleLiquidity =  async () =>{
        if(window.ethereum){
            if(token1!=token2){
            var web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
                if(accounts.length!=0){
                    if(token1=="ETH"||token2=="ETH")
                        addLiquidityETH();
                    else addLiquidityTokens();
                    }
                else{
                    console.log("metamask have to be installed")
                }
            }
        }
        }

        const addLiquidityETH = async () =>{
            setLoading(true);

            //swap
            var tokenAddress,tokenContract, amountToken,amountETH;
            if(token1=="ETH"){
                tokenAddress=token2=="Atari"?atari:fantom;
                tokenContract=token2=="Atari"?atariContract:fantomContract;
                amountToken=amount2;
                amountETH=amount1;
            }
            else{
                tokenAddress=token1=="Atari"?atari:fantom;
                tokenContract=token1=="Atari"?atariContract:fantomContract;
                amountToken=amount1;
                amountETH=amount2;
            }

            console.log(amountETH);

            
            var date=new Date();
            var seconds = Math.floor(date.getTime() / 1000)+1000000;

            //approve token

            var Data=await tokenContract.methods.approve(routerAddress,web3.utils.toBN(parseInt(amountToken*Math.pow(10,9)))).encodeABI();
            var Txdetail = {
                        from: window.ethereum.selectedAddress,
                        to: tokenAddress,
                        value: web3.utils.toHex(web3.utils.toWei("0")),
                        gas: web3.utils.toHex(210000),
                        gasPrice: web3.utils.toHex(web3.utils.toWei('50', 'gwei')),
                        data:Data
                    }

            window.ethereum.request({ method: 'eth_sendTransaction', params: [Txdetail] }).then(async (res) => {

                console.log(res);
                var ethFlag = true;
                        while(ethFlag){
                            await web3.eth.getTransactionReceipt(res,async (error, receipt) => {
                                if (error) {
                                    console.log(error)
                                } else if (receipt == null) {
                                        console.log("repeat")
                                } else {
                                    console.log("confirm", receipt)
                                    ethFlag = false;

                                        //addliquidity
                                        console.log(web3.utils.toWei(amountETH.toString()),tokenAddress,window.ethereum.selectedAddress,seconds);
                                        var Data=await exchangeContract.methods.addLiquidityETH( tokenAddress,web3.utils.toBN(parseInt(amountToken*Math.pow(10,9))),0,0,window.ethereum.selectedAddress,seconds).encodeABI();

                                        var Txdetail = {
                                                    from: window.ethereum.selectedAddress,
                                                    to: routerAddress,
                                                    value: web3.utils.toHex(web3.utils.toWei(amountETH.toString(),"ETH")),
                                                    gas: web3.utils.toHex(4000000),
                                                    gasPrice: web3.utils.toHex(web3.utils.toWei('50', 'gwei')),
                                                    data:Data
                                                }
                                        window.ethereum.request({ method: 'eth_sendTransaction', params: [Txdetail] }).then(async (res) => {
                                            console.log(res);
                                            var ethFlag = true;
                                            while(ethFlag){
                                                await web3.eth.getTransactionReceipt(res, (error, receipt) => {
                                                    if (error) {
                                                        console.log(error)
                                                        alert("stake failed");
                                                    } else if (receipt == null) {
                                                            console.log("repeat")
                                                    } else {
                                                        console.log("confirm", receipt);
                                                        ethFlag = false;
                                                        setLoading(false);
                                                    }
                                                });
                                                }
                                        });
                                    }				
                                });	
                            }
        })
        .catch(()=>{
            setLoading(false);
        })
        }

        const addLiquidityTokens = async () =>{
            setLoading(true);
            //swap
            var path=[];
            path[0]=token1=="Atari"?atari:fantom;
            path[1]=token2=="Atari"?atari:fantom;

            var tokenAddress1=token1=="Atari"?atari:fantom;
            var tokenContract1=token1=="Atari"?atariContract:fantomContract;

            var tokenAddress2=token2=="Atari"?atari:fantom;
            var tokenContract2=token2=="Atari"?atariContract:fantomContract;
            
            var date=new Date();
            var seconds = Math.floor(date.getTime() / 1000)+1000000;

            //approve token
            var Data=await tokenContract1.methods.approve(routerAddress,web3.utils.toBN(parseInt(amount1*Math.pow(10,9)))).encodeABI();
            var Txdetail = {
                        from: window.ethereum.selectedAddress,
                        to: tokenAddress1,
                        value: web3.utils.toHex(web3.utils.toWei("0")),
                        gas: web3.utils.toHex(210000),
                        gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei')),
                        data:Data
                    }

            window.ethereum.request({ method: 'eth_sendTransaction', params: [Txdetail] }).then(async (res) => {

                console.log(res);
                var ethFlag = true;
                        while(ethFlag){
                            await web3.eth.getTransactionReceipt(res,async (error, receipt) => {
                                if (error) {
                                    console.log(error)
                                } else if (receipt == null) {
                                        console.log("repeat")
                                } else {
                                    console.log("confirm", receipt)
                                    ethFlag = false;
                                    var Data=await tokenContract2.methods.approve(routerAddress,web3.utils.toBN(parseInt(amount2*Math.pow(10,9)))).encodeABI();

                                    var Txdetail = {
                                            from: window.ethereum.selectedAddress,
                                            to: tokenAddress2,
                                            value: web3.utils.toHex(web3.utils.toWei("0")),
                                            gas: web3.utils.toHex(210000),
                                            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
                                            data:Data
                                        }

                                        window.ethereum.request({ method: 'eth_sendTransaction', params: [Txdetail] }).then(async (res) => {
                                            console.log(res);
                                            var ethFlag = true;
                                            while(ethFlag){
                                                await web3.eth.getTransactionReceipt(res,async (error, receipt) => {
                                                    if (error) {
                                                        console.log(error)
                                                    } else if (receipt == null) {
                                                            console.log("repeat")
                                                    } else {
                                                        console.log("confirm", receipt)
                                                        ethFlag = false;
                                                        
                                                        //addliquidity

                                                        console.log(web3.utils.toWei(amount1.toString()),path,window.ethereum.selectedAddress,seconds);
                                                        var Data=await exchangeContract.methods.addLiquidity( path[0],path[1],web3.utils.toBN(parseInt(amount1*Math.pow(10,9))),web3.utils.toBN(parseInt(amount2*Math.pow(10,9))),0,0,window.ethereum.selectedAddress,seconds).encodeABI();
                                                        
                                                        var Txdetail = {
                                                                    from: window.ethereum.selectedAddress,
                                                                    to: routerAddress,
                                                                    value: web3.utils.toHex("0"),
                                                                    gas: web3.utils.toHex(4000000),
                                                                    gasPrice: web3.utils.toHex(web3.utils.toWei('50', 'gwei')),
                                                                    data:Data
                                                                }
                                                        window.ethereum.request({ method: 'eth_sendTransaction', params: [Txdetail] }).then(async (res) => {
                                                            console.log(res);
                                                            var ethFlag = true;
                                                            while(ethFlag){
                                                                await web3.eth.getTransactionReceipt(res, (error, receipt) => {
                                                                    if (error) {
                                                                        console.log(error)
                                                                        alert("stake failed");
                                                                    } else if (receipt == null) {
                                                                            console.log("repeat")
                                                                    } else {
                                                                        console.log("confirm", receipt);
                                                                        ethFlag = false;
                                                                        setLoading(false);
                                                                    }
                                                                });
                                                                }
                                                        });
                                                
                                                }
                                            })
                                            }
                                                
                                        });

                                }});
                            }

        })
        .catch(()=>{
            setLoading(false);
        })
        }
//remove liquidity

useEffect( async()=>{
    if(connect){
        if(token1!=token2){
            if(liquiditystep=="2"){
                var pairAddress = await factoryContract.methods.getPair(tokenAddress1, tokenAddress2).call();
                var pairContract = new ethers.Contract(pairAddress,tokenAbi,signer);
                const UserAddress=await signer.getAddress();
                var lpamount=ethers.utils.formatUnits(await pairContract.balanceOf(UserAddress));
                setLpAmount(lpamount);
            }
        }
    }
})

const handleLiquidity1 =  async () =>{
    if(connect){
        if(token1!=token2){
                if(removeAmount<lpAmount){
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                        
                    var pairContract = new ethers.Contract(pairAddress,tokenAbi,signer);
                    var tx= await pairContract.approve(routerAddress,ethers.utils.parseUnits(removeAmount.toString().slice(0,15)))
                    .catch((err)=>{

                    })
                    if(tx!=null){
                        await  provider.waitForTransaction(tx.hash);
                        var ExchangeContract=new ethers.Contract(routerAddress,exchangeAbi,signer);
                    
                        var date=new Date();
                        var seconds = Math.floor(date.getTime() / 1000)+1000000;
                        const UserAddress=await signer.getAddress();
                        await ExchangeContract.removeLiquidity(tokenAddress1,tokenAddress2,ethers.utils.parseUnits(removeAmount.toString().slice(0,15)),0,0,UserAddress,seconds);    
                    }

                   }
        }
    }
}

const handleAmount = (e)=>{
    setRemoveAmount(e.target.value);
}
    return(
        <div className = "x-swapCard-container" style = {screenWidth>800?{paddingLeft:"30px", paddingRight: "30px"}:{paddingRight: "10px", paddingLeft: "10px"}}>
            <div className = "x-font1">
                <span className = "x-font2">{liquiditystep=="1"?"Add":"Remove"} Liquidity</span>
                <span className = "float-right">
                    <button color="primary" className = "x-swapCard-submit-button1" onClick={()=>{if(liquiditystep=="1")setLiquidityStep("2");else setLiquidityStep("1")}}>
                        {liquiditystep=="1"?"remove":"add"}
                    </button>
                </span>
            </div>
            <SwapForm role = "Input" handleToken = {handleToken1} flag = {flag1} setFlag = {setFlag1} token = {token1} handleAmount = {handleAmount1} balance = {balance1} amount = {amount1}/>
            <div className = "text-center">
                <IconButton color="primary" aria-label="upload picture" component="span">
                    <ArrowDownwardIcon style = {{color: "white"}} onClick = {handleReverse}/>
                </IconButton>
            </div>
            <SwapForm handleToken = {handleToken2} flag = {flag2} setFlag = {setFlag2} token = {token2} handleAmount = {handleAmount2} balance = {balance2} amount = {amount2}/>
            
            {
                liquiditystep!="1"?
                <div className = "x-font3" style = {{color: "white", float: "right"}}>balance <span>{lpAmount}</span></div>
                :""
            }       
            {
                liquiditystep!="1"?
                <input type = "number" className = "x-swapForm-input" placeholder="0.00" onChange = {(e)=>handleAmount(e)} value = {removeAmount.toString().slice(0,15)}/>
                :""
            } 

            <div className = "mt-5">
            {liquiditystep=="1"?
                <button className = "x-swapCard-submit-button" onClick = {handleLiquidity}>{loading?<img src = "/img/loading.gif" />: "Enter an amount"}</button>
                :<button className = "x-swapCard-submit-button" onClick = {handleLiquidity1}>{loading?<img src = "/img/loading.gif" />: "Enter an amount"}</button>
            }
            </div>

        </div>
    )
}

export default LiquidityCard;