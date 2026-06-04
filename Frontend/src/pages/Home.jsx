import React, { useContext, useState } from 'react'
import WithAuth from '../utils/WithAuth.jsx';
import { useNavigate } from 'react-router-dom';
import "../App.css"
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { HistoryContext } from '../contexts/HistoryContext.jsx';

function HomeComponent() {

    const [meetingCode, setMeetingCode] = useState("");
    const [meetingCodeError, setMeetingCodeError] = useState("");
    const {addToHistory} = useContext(HistoryContext);

    let navigate = useNavigate();
    let handleJoinVideoCall = async()=>{
        const trimmedMeetingCode = meetingCode.trim();
        if (!trimmedMeetingCode) {
            setMeetingCodeError("Enter a meeting code.");
        return;
        }

        setMeetingCodeError("");
        await addToHistory(trimmedMeetingCode);
        navigate(`/${trimmedMeetingCode}`);
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
                        <TextField
                            value={meetingCode}
                            onChange={(e) => {
                                setMeetingCode(e.target.value);
                                setMeetingCodeError("");
                            }}
                            id="outlined-basic"
                            label="Meeting Code"
                            variant="outlined"
                            error={Boolean(meetingCodeError)}
                            helperText={meetingCodeError}
                        />
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