import React, { useContext, useState } from 'react'
import WithAuth from '../utils/WithAuth.jsx';
import { useNavigate } from 'react-router-dom';
import "../App.css"
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { HistoryContext } from '../contexts/HistoryContext.jsx';

function HomeComponent() {

    const [meetingCode, setMeetingCode] = useState("");
    const {addToHistory} = useContext(HistoryContext);

    let navigate = useNavigate();
    let handleJoinVideoCall = async()=>{
        await addToHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    let handleLogout = ()=>{
        localStorage.removeItem("token");
        navigate("/auth")
    }

  return (
    <>
        <div className="navBar">
            <div style={{display: "flex", alignItems: "center"}}>
                <a href="/home" style={{textDecoration: "none", color: "black"}}><h1> Live Chats </h1></a>
            </div>

            <div className='topContainer' >
                <Button onClick={()=>{navigate("/history")}} startIcon={<RestoreIcon />}>History </Button>
                <Button variant="contained" color="error" onClick={handleLogout}>LogOut</Button>
            </div>
        </div>

        <div className="meetContainer">
            <div className="leftPanel">
                <div>
                    <h2>Providing Quality Calls</h2>
                    <div style={{display: "flex", gap: "10px"}}>
                        <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
                        <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>
                    </div>
                </div>
            </div>

            <div className="rightPanel">
                <img src="/logo3.png" alt="CallingImg" />
            </div>

        </div>
    </>
  )
}

export default WithAuth(HomeComponent);