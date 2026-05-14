import React, { useContext, useEffect, useState } from 'react'
import { HistoryContext } from '../contexts/HistoryContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';

import { IconButton } from '@mui/material';

export default function History() {
  
    const {getUserHistory} = useContext(HistoryContext);
    const [meetings, setMeetings] = useState([]);
    const routeTo = useNavigate();

    useEffect(()=>{
        const fetchHistory = async()=>{
            try{
                const history = await getUserHistory();
                setMeetings(history);
            }catch(err){
                console.log(err);
            }
        }

        fetchHistory();
    }, [])

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }

  return (
    <div>
        <IconButton onClick={() => {
                routeTo("/home")
            }}>
                <HomeIcon />
            </IconButton >
            {
                (meetings.length !== 0) ? meetings.map((e, i) => {
                    return (
                        <>
                            <Card key={i} variant="outlined">
                                <CardContent>
                                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                        Code: {e.meetingCode}
                                    </Typography>

                                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                        Date: {formatDate(e.date)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </>
                    )
                }) : <> <h2 style={{textAlign: "center"}}>No History yet! Join a Call to see your History</h2></>
            }
    </div>
  )
}
