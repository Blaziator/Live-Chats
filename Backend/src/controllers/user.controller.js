import User from "../models/user.model.js";
import Meeting from "../models/meeting.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please enter correct username or password." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid username or password",
      });
    }

    let token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();
    return res.status(httpStatus.OK).json({ token: token });
    
  } catch (err) {
    return res.status(500).json({ message: `Something went wrong: ${err}` });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser = new User({ name, username, password: hashedPassword });

    await newUser.save();
    res
      .status(httpStatus.CREATED)
      .json({ message: "User registered successfully" });
  } catch (err) {
    res.json({ message: `Something went wrong: ${err}` });
  }
};

const getUserHistory = async(req, res)=>{
  const {token} = req.query;

  try{
    const user = await User.findOne({token});
    if(!user){
      return res.status(401).json({message: "Invalid or expired token"});
    }
    const meetings = await Meeting.find({user_id: user.username})
    
    res.json(meetings);

  }catch(err){
    res.json({message: `Something Went Wrong ${err}` })
  }
}

const addToHistory = async(req,res)=>{
  const {token, meeting_code} = req.body;
  
  try{
    const user = await User.findOne({token});
    if(!user){
      return res.status(401).json({message: "Invalid or expired token"});
    }
    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meeting_code
    });

    await newMeeting.save();

    res.status(httpStatus.CREATED).json({message: "Meeting Code added to History"})
  }catch(err){
    res.json({message: `Something Went Wrong ${err}` })
  }
}

export { login, register, getUserHistory, addToHistory };
