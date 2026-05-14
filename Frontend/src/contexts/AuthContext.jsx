import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import httpStatus from 'http-status';
import server from '../environment';

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
});

export const AuthProvider = ({children})=>{
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const [userData, setUserData] = useState(authContext);

    const handleRegister = async(name, username, password)=>{
        try{
            let request = await client.post("/register", {
                name, username, password
            });

            if(request.status === httpStatus.CREATED){
                return request.data.message;
            }

        }catch(err){
            throw err;
        }
    }

    const handleLogin = async(username, password)=>{
        try{
            let request = await client.post("/login",{
                username, password
            });

            console.log(username, password)
            console.log(request.data)

            if(request.status === httpStatus.OK){
                localStorage.setItem("token", request.data.token);
                navigate("/home");  
            }

        }catch(err){
            throw err;
        }
    }
    
    const data = {
        userData, setUserData, handleRegister, handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )

}