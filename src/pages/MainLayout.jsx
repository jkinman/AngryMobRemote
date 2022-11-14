import React from "react";
import { Outlet } from "react-router-dom";


export const MainLayout = (props) => {

    return(
        <div className="peerLayout">
            <h2 style={{textAlign:'center'}}>Web RTC Orientation Test</h2>
            <Outlet />
        </div>
    )
}

export default MainLayout