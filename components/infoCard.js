import React from "react";

function InfoCard(){
    return(
        <div className = "x-infoCard">
            <div >
                <span className = "x-font3">Minimum received</span>
                <span className = "x-font3 float-right">1.269 BNB</span>
            </div>
            <div >
                <span className = "x-font3">Price Impact</span>
                <span className = "x-font4 float-right">0.10%</span>
            </div>
            <div >
                <span className = "x-font3">Liquidity Provider Fee</span>
                <span className = "x-font3 float-right">0.054 BNB</span>
            </div>
        </div>
    )
}

export default InfoCard;