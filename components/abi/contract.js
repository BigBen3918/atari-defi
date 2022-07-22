import Web3 from 'web3';
import exchangeAbi from './exchange.json';
import factoryAbi from './factory.json';
import tokenAbi from './token.json';
import pairAbi from './pair.json';
import stakeAbi from './staking.json'


export const testnet = `https://mainnet.infura.io/v3/0c5409f01bb944168d3bb4b03a674f15`;
export var web3 = new Web3(new Web3.providers.HttpProvider(testnet));
export var factoryAddress = "0x1f98431c8ad98523631ae4a59f267346ea31f984";
export var routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
export var stakeAddress = "0xAff06d0A92474b5c2cDbb0Eb00B4D41802bA823A";
export var atari = "0xdacd69347de42babfaecd09dc88958378780fb62";
export var fantom = "0x4e15361fd6b4bb609fa63c81a2be19d873717870";
export var weth="0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export var usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7";
export var factoryContract =new web3.eth.Contract(factoryAbi, factoryAddress);
export var exchangeContract= new web3.eth.Contract(exchangeAbi,routerAddress);
export var stakeContract= new web3.eth.Contract(stakeAbi,stakeAddress);
export var atariContract= new web3.eth.Contract(tokenAbi,atari);
export var fantomContract= new web3.eth.Contract(tokenAbi,fantom);
export var usdtContract= new web3.eth.Contract(tokenAbi,usdt);
export const gasLimitHex = web3.utils.toHex(2200000);
export const PairAbi = pairAbi;
export const TokenAbi = tokenAbi;
