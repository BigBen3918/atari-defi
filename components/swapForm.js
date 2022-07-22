import React, {useState, useEffect, useRef} from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {Grid} from '@material-ui/core';

function SwapForm(props){
    const {role, handleToken, flag, setFlag, token, handleAmount, balance, amount} = props;
    const refContainer = useRef(null);

    useEffect(() => {
        if (!flag) {
          document.addEventListener('mousedown', handleClickOutside);
        } else {
          document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [flag]);

      const handleClickOutside = (e) => {
        if (refContainer.current && refContainer.current.contains(e.target)) {
          // inside click
          return;
        }
        // outside click
        setFlag(true);
      };

    
    return(
        <div style={{ padding:15, backgroundColor: 'rgb(33,36,41)',   borderRadius: 25}}>
            {/* <div className = "x-font3">
                {role}
            </div> */}
            <Grid container>
                
                <Grid style={{alignSelf:'center'}} item xs = {6} sm = {4} md = {4} ref = {refContainer}>
                    <button className = "x-swapForm-dropdown" onMouseDown = {()=>setFlag(!flag)}>
                        <img src = {`/img/token/${token}.png`} width = "20px"/>
                        <span className = "x-swapForm-token"> {token}</span>
                        <ExpandMoreIcon />
                    </button>
                    <div className = "x-swapForm-dropdown-container" style = {flag?{display: "none"}: null}>
                        <div>
                            <button className = "x-swapForm-dropdown-item" ref = {refContainer} onClick = {(e)=>handleToken(e,"ETHER")}>
                                <img src = {`/img/token/ether.png`} width = "20px"/>
                                <span className = "x-swapForm-token"> ETH</span>
                            </button>
                        </div>
                        <div>
                            <button className = "x-swapForm-dropdown-item" onClick = {(e)=>handleToken(e,"Atari")}>
                                <img src = {`/img/token/atari.png`} width = "20px"/>
                                <span className = "x-swapForm-token"> ATARI</span>
                            </button>
                        </div>
                        <div>
                            <button className = "x-swapForm-dropdown-item" onClick = {(e)=>handleToken(e,"Fantom")}>
                                <img src = {`/img/token/fantom.png`} width = "20px"/>
                                <span className = "x-swapForm-token"> FANTOM</span>
                            </button>
                        </div>
                    </div>
                </Grid>
                <Grid item xs = {6} sm = {8} md = {8}>
                    <div className = "x-font3" style = {{color: "white", float: "right"}}>balance <span>{balance}</span></div>
                    <input type = "number" className = "x-swapForm-input" placeholder="0.00" onChange = {(e)=>handleAmount(e)} value = {amount.toString().slice(0,15)}/>
                </Grid>
            </Grid>
        </div>
    )
}

export default SwapForm;