import Web3 from 'web3';
import { ethers } from 'ethers';
import tokenAbi from './token.json';
import pairAbi from './pair.json';
import stakeAbi from './staking.json'

export const mainnet = `https://mainnet.infura.io/v3/0c5409f01bb944168d3bb4b03a674f15`;
export var provider = new ethers.providers.JsonRpcProvider(mainnet);
export var stakeAddress = "0x1afEBF01f5eE7195c7044939E20e2FAC6A60b18f";
export var atari = "0xdacD69347dE42baBfAEcD09dC88958378780FB62";
export var weth="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export var usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export var pairEthAtari = "0xc4d9102e36c5063b98010A03C1F7C8bD44c32A00";
export var pairEthUsdt = "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852";

export var stakeContract= new ethers.Contract(stakeAddress,stakeAbi,provider);
export var atariContract= new ethers.Contract(atari,tokenAbi,provider);
export var usdtContract = new ethers.Contract (usdt,tokenAbi,provider);
export var wethContract = new ethers.Contract (weth,tokenAbi,provider);
export const PairAbi = pairAbi;
export const TokenAbi = tokenAbi;


export var fantom = "0x4e15361fd6b4bb609fa63c81a2be19d873717870";
export var fantomContract= new ethers.Contract(fantom,tokenAbi,provider);
