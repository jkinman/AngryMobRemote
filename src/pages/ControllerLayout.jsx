import React from "react";
import { Outlet } from "react-router-dom";


export const MainLayout = (props) => {

    return(
        <div className="controllerLayout">
            <h2 style={{textAlign:'center'}}>Web RTC Controller</h2>
            <Outlet />
        </div>
    )
}

export default MainLayout