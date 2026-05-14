import React from "react";
import '../App.css'
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage(){

    const router = useNavigate();

    return(
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <a href="/home" style={{textDecoration: "none", color: "white"}}><h1> Live Chats </h1></a>
                </div>
                <div className="navlist">
                    <p onClick={()=>{router("/q123qcd")}}>Join as Guest</p>
                    <p onClick={()=>{router("/auth")}}> Register</p>
                    <div role="button"> 
                        <p onClick={()=>{router("/auth")}}> Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">

                <div className="container1">
                    <h1><span style={{color: "#FF9839"}}>Connect</span> with your loved ones </h1>
                    <p>Cover a distance by <b>Live Chats</b></p>

                    <div role="button" className="getStarted">
                        <Link to={"/auth"}>Get Started</Link>
                    </div>

                </div>

                <div className="container2">
                    <img src="/mobile.png" alt="mobile-cover-img" />
                </div>



            </div>

        </div>
    )
}