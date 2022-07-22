import React, {useEffect, useState} from 'react';
import {Navbar, Form} from 'react-bootstrap';
import {Button} from '@material-ui/core';
import Web3 from 'web3';
import {useRouter} from 'next/router';


function Navigation(){
    const [flag, setFlag] = useState(false);
    const router = useRouter();

    function handleChainChanged(_chainId) {
    // We recommend reloading the page, unless you must do otherwise
    window.location.reload();
    }

    function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
          // MetaMask is locked or the user has not connected any accounts
          console.log('Please connect to MetaMask.');
        } 
        window.location.reload();
      }

    useEffect(async()=>{
        var web3 = new Web3();
        if(typeof window !== "undefined"){
        if(window.ethereum){
            web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            if(accounts.length==0||chainId!=1){
                setFlag(false);
            }
            else
                setFlag(true);
                window.ethereum.on('chainChanged', handleChainChanged);
                window.ethereum.on('accountsChanged', handleAccountsChanged);
            }
        }
    }
    )
    const handleConnect =async () =>{
        console.log("connect");
        if(typeof window !== "undefined"){
            if (window.ethereum) {
                console.log("good");
                const chainId = await ethereum.request({ method: 'eth_chainId' });
                if(!flag&&chainId==1)
                    window.ethereum.enable().then((res)=> {
                        setFlag(true);
                    }).catch((err)=> {
                        setFlag(false);
                    })
                if(chainId!=1){
                    alert("Please change network to ethereum main net")
                }
                }
            else{
                alert("You have to use the MetaMask wallet in your browser!")
            }
        }
    }
    return(
        <div className = "x-nav-container">
            <div className = "diceGrid">
                <Navbar.Brand href="/"><img src = "/img/logo.png" alt = "logo" width = "120px"/></Navbar.Brand>
                <Button variant="contained" className = "x-nav-button" onClick = {handleConnect}>{flag?"Connected":"connect"}</Button>
            </div>
        </div>
    )
}

export default Navigation;