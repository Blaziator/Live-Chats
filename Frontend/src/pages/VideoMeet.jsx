import server from "../environment";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import styles from "../styles/videoComponent.module.css";
import { Badge, IconButton, TextField, Tooltip } from "@mui/material";
import { Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from '@mui/icons-material/Close';

const server_url = server;
var connections = {};

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  const videoRef = useRef([]);
  const navigate = useNavigate();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState(false);
  let [showModal, setShowModal] = useState(false);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);
  
  let [lobbyError, setLobbyError] = useState("");

  const getPermissions = async () => {
    let rawStream = null;
    if (!navigator.mediaDevices?.getUserMedia) {
      setVideoAvailable(false);
      setAudioAvailable(false);
      setScreenAvailable(false);
      return;
    }

    let hasVideo = false;
    let hasAudio = false;

    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      hasVideo = true;
      videoPermission.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.log("Video permission unavailable:", err);
    }

    try {
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      hasAudio = true;
      audioPermission.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.log("Audio permission unavailable:", err);
    }

    setVideoAvailable(hasVideo);
    setAudioAvailable(hasAudio);
    setScreenAvailable(Boolean(navigator.mediaDevices.getDisplayMedia));
    try{
      if (hasVideo || hasAudio) {
        rawStream = await navigator.mediaDevices.getUserMedia({
          video: hasVideo,
          audio: hasAudio,
        });
      }
      const completeStream = createCompleteStream(rawStream);
      attachLocalStream(completeStream);
    }catch(err){
      console.log("Unable to create local stream:", err);

      const fallbackStream = getFallbackStream();
      attachLocalStream(fallbackStream);
    }
    
  };

  let createCompleteStream = (stream)=>{
    const videoTrack = stream?.getVideoTracks()[0] || avatarVideoTrack(username || "Guest");
    const audioTrack = stream?.getAudioTracks()[0] || silence();

    return new MediaStream([videoTrack, audioTrack]);
  }

  let attachLocalStream = (stream) => {
    window.localStream = stream;

    if (localVideoRef.current) {
      if (localVideoRef.current.srcObject !== stream) {
        localVideoRef.current.srcObject = stream;
      }
      
      localVideoRef.current.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.log("Local video play failed:", err);
          }
        });
    }
  };

  let getFallbackStream = () => {
    return new MediaStream([avatarVideoTrack(username || "Guest"), silence()]);
  };

  let addLocalTracksToPeerConnection = (peerConnection, stream) => {
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });
  };

  let replaceTracksForAllConnections = (stream) => {
    const videoTrack = stream.getVideoTracks()[0] || avatarVideoTrack(username || "Guest");
    const audioTrack = stream.getAudioTracks()[0] || silence();

    for (let id in connections) {
      const senders = connections[id].getSenders();

      const videoSender = senders.find(
        (sender) => sender.track && sender.track.kind === "video",
      );

      const audioSender = senders.find(
        (sender) => sender.track && sender.track.kind === "audio",
      );

      if (videoSender) {
        videoSender.replaceTrack(videoTrack);
      }

      if (audioSender) {
        audioSender.replaceTrack(audioTrack);
      }
    }
  };

  let upsertRemoteVideo = (socketListId, stream) => {
  setVideos((prevVideos) => {
    const videoExists = prevVideos.some(
      (video) => video.socketId === socketListId
    );

    let updatedVideos;

    if (videoExists) {
      updatedVideos = prevVideos.map((video) =>
        video.socketId === socketListId
          ? { ...video, stream }
          : video
      );
    } else {
      updatedVideos = [
        ...prevVideos,
        {
          socketId: socketListId,
          stream,
          autoPlay: true,
          playsInline: true,
        },
      ];
    }
    videoRef.current = updatedVideos;
    return updatedVideos;
  });
};

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.log(err);
    }

  const completeStream = createCompleteStream(stream);

    attachLocalStream(completeStream);
    replaceTracksForAllConnections(completeStream);

    completeStream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();

            tracks.forEach((track) => track.stop());
          } catch (err) {
            console.log(err);
          }

          const fallbackStream = getFallbackStream();
          attachLocalStream(fallbackStream);
          replaceTracksForAllConnections(fallbackStream);
        }),
    )
  }

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();

    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  // let black = ({ width = 640, height = 480 } = {}) => {
  //   let canvas = Object.assign(document.createElement("canvas"), {
  //     width,
  //     height,
  //   });

  //   canvas.getContext("2d").fillRect(0, 0, width, height);
  //   let stream = canvas.captureStream();
  //   return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  // };

  let avatarVideoTrack = (name = "Guest", {width = 640, height = 480} = {})=>{
    let canvas = Object.assign(document.createElement("canvas"), {
      width, height,
    });

    const ctx = canvas.getContext("2d");

    const displayName = name.trim() || "Guest";
    const firstLetter = displayName.charAt(0).toUpperCase();

    const drawAvatar = () => {
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 35, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 68px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(firstLetter, width / 2, height / 2 - 35);

    ctx.font = "30px Arial";
    ctx.fillText(displayName, width / 2, height / 2 + 85);
  };

  drawAvatar();

  const stream = canvas.captureStream(5);

  const intervalId = setInterval(drawAvatar, 1000);

  const track = stream.getVideoTracks()[0];
  track.enabled = true;

  track.onended = () => {
    clearInterval(intervalId);
  };

  return track;
  }

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
    navigator.mediaDevices
      .getUserMedia({
        video: video && videoAvailable,
        audio: audio && audioAvailable,
      })
      .then(getUserMediaSuccess)
      .catch((err) => {
        console.log(err);
        const fallbackStream = getFallbackStream();
        attachLocalStream(fallbackStream);
        replaceTracksForAllConnections(fallbackStream);
      });
  } else {
    try {
      let tracks = localVideoRef.current?.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
    } catch (err) {}
      const fallbackStream = getFallbackStream();
        attachLocalStream(fallbackStream);
        replaceTracksForAllConnections(fallbackStream);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((err) => console.log(err));
                })
                .catch((err) => console.log(err));
            }
          })
          .catch((err) => console.log(err));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((err) => console.log(err));
      }
    }
  };

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender, data }]);

    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
        setVideos((videos) => {
          const updatedVideos = videos.filter(
            (video) => video.socketId !== id
          );
          videoRef.current = updatedVideos;
          return updatedVideos;
        });
      });
        
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;
          
          if (connections[socketListId]) return;

          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };

          connections[socketListId].ontrack = (event) => {
            if (event.track.kind !== "video") return;

            const [remoteStream] = event.streams;
            upsertRemoteVideo(
              socketListId,
              createCompleteStream(remoteStream || new MediaStream([event.track]))
            );
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            addLocalTracksToPeerConnection(
              connections[socketListId],
              window.localStream,
            );
          } else {
            //blackSilence

            const fallbackStream = getFallbackStream();
            attachLocalStream(fallbackStream);
            addLocalTracksToPeerConnection(
              connections[socketListId],
              window.localStream,
            );
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }),
                  );
                })
                .catch((err) => console.log(err));
            });
          }
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let connect = () => {
    if (!username.trim()) {
        setLobbyError("Please enter your user name before joining.");
        return;
    }
    setLobbyError("");
    setAskForUsername(false);
    getMedia();
  };

  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.log(err);
    }

    const completeStream = createCompleteStream(stream);

    attachLocalStream(completeStream);
    replaceTracksForAllConnections(completeStream);

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();

            tracks.forEach((track) => track.stop());
          } catch (err) {
            console.log(err);
          }

          const fallbackStream = getFallbackStream();
          attachLocalStream(fallbackStream);
          replaceTracksForAllConnections(fallbackStream);

          getUserMedia();
        }),
    );
  };

  let handleSendMessage = () => {
    if(!message.trim()) return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let handleMessageKeyDown = (e)=>{
        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            handleSendMessage();
        }
    }

  let handleScreenShare = async() => {
    
    if(screen){
      const tracks = window.localStream?.getTracks();
      tracks?.forEach(track => track.stop());
      setScreen(false);
      getUserMedia();
      return;
    }

    try{

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true, audio: true
      });

      setScreen(true);
       getDisplayMediaSuccess(stream);

    }catch(err){
      console.log(err);
      setScreen(false);
    }

  };

  let handleChat = () => {
    setShowModal(!showModal);

    if (!showModal === true) {
      setNewMessages(0);
    }
  };

  let handleEndCall = () => {
    try {
      if (window.localStream) {
            window.localStream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      console.log(err);
    }
     
    window.location.href = "/home";
  };

  return (
    <>
      {askForUsername === true ? (
        <div className={styles.parentLobby}>
          <div className={styles.leftSection}>
            <h2>Ready to join?</h2>
            <div className={styles.lobbyVideoPreview}>
              <video ref={localVideoRef} autoPlay muted ></video>
            </div>
          </div>
          <div className={styles.joinLayout}>
            <TextField
              id="outlined-basic"
              label="Username"
              value={username}
              onChange={(e) => {setUsername(e.target.value); setLobbyError("");}}
              variant="outlined"
            />
            {lobbyError && (<p className={styles.lobbyError}>{lobbyError}</p>)}
            <br />
            <Button variant="contained" onClick={connect} size="large">
              Join Meeting
            </Button>
          </div>
          
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                <h1>Chat</h1>
                <IconButton onClick={()=>setShowModal(false)} size="small">
                    <CloseIcon />
                </IconButton>
                </div>
                <div className={styles.chattingDisplay}>
                  {messages.map((item, index) => (
                    <div className={styles.chatMessage} key={index}>
                      <p className={styles.chatSender}>{item.sender}</p>
                      <div className={styles.chatBubble}>
                        {item.data}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleMessageKeyDown}
                    id="standard-basic"
                    label="Type your message here"
                    variant="standard"
                  />
                  <Button variant="contained" onClick={handleSendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainer}>
            <Tooltip title={video ? "Turn camera off" : "Turn camera on"}>
              <IconButton style={{ color: "white" }} onClick={handleVideo}>
                {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={audio ? "Mute microphone" : "Unmute microphone"}>
              <IconButton style={{ color: "white" }} onClick={handleAudio}>
                {audio === true ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            </Tooltip>

            
              {screenAvailable === true ? (
                <Tooltip title={screen ? "Stop screen sharing" : "Share screen"}>
                  <IconButton
                    style={{ color: "white" }}
                    onClick={handleScreenShare}
                  >
                    {screen === true ?
                      <StopScreenShareIcon />
                    : 
                      <ScreenShareIcon />
                    }
                  </IconButton>
                </Tooltip>
              ) : (
                <></>
            
              )}

            <Tooltip title="Open chat">
              <Badge badgeContent={newMessages} max={999} color="secondary">
                <IconButton onClick={handleChat} style={{ color: "white" }}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </Tooltip>
            
            <Tooltip title="End call">
              <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                <CallEndIcon />
              </IconButton>
            </Tooltip>
          </div>

          <video
            className={styles.meetUserMedia}
            ref={localVideoRef}
            autoPlay
            muted
          ></video>
          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream && ref.srcObject !== video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}