import axios from "axios";
import { createContext } from "react";
import server from '../environment';
export const HistoryContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
});

export const HistoryProvider = ({ children }) => {

    const getUserHistory = async () => {
        try {
            let request = await client.get(
                "/get_all_activity",
                {
                    params: {
                        token: localStorage.getItem("token")
                    }
                }
            );

            return request.data;

        } catch(err){
            console.log(err);
            return [];
        }
    };

    const addToHistory = async (meetingCode) => {

        try {
            let request = await client.post(
                "/add_to_activity",
                {
                    token: localStorage.getItem("token"),
                    meeting_code: meetingCode
                }
            );

            return request;
        } catch(err){
            console.error("Could not save meeting to history:", err.response?.data?.message || err.message);
        }
    };

    const data = {
        getUserHistory,
        addToHistory
    };

    return (
        <HistoryContext.Provider value={data}>
            {children}
        </HistoryContext.Provider>
    );
};