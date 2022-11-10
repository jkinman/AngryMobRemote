import React from "react";
import { Outlet } from "react-router-dom";



export const MainLayout = (props) => {

    return(
        <div>
            <h2>Main Layout</h2>
            <Outlet />
        </div>
    )
}

export default MainLayout