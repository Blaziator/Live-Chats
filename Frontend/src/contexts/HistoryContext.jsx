import axios from "axios";
import { createContext } from "react";

export const HistoryContext = createContext({});

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users"
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
            throw err;
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
            throw err;
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