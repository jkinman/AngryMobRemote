import React from "react";
import { Outlet } from "react-router-dom";


export const MainLayout = (props) => {

    return(
        <div>
            <h2>Orientation Demo Home</h2>
            <Outlet />
        </div>
    )
}

export default MainLayout