import axios from "axios";

const API_PROFILE_URL = 'https://localhost:44320/api/Profiles';
const API_USER_URL = 'https://localhost:44320/api/Users';

export const getProfileById = async(userId,token) =>{
    return await axios.get(`${API_PROFILE_URL}/${userId}`,{
        Headers:{
            'Authorization':`Bearer ${token}`
        }
    })
}
export const updateProfile = async(data,token) =>{
    try{
        return await axios.put(`${API_PROFILE_URL}`,data,{
            headers:{
                'Authorization':`Bearer ${token}`
            }
        })
    }catch (error) {
        console.error('Error update profile:', error.response || error);
    }
}
export const updateAvatar = async(userId,image,token) =>{
    try {
    return await axios.put(`${API_PROFILE_URL}/${userId}/image`,image,{
        headers:{
            'Authorization':`Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    } catch (error) {
        console.error('Error uploading image:', error.response || error);
    }
}
export const createEventOrganizer = async(data,token) =>{
    try {
    return await axios.post(`${API_USER_URL}/event-organizer`,data,{
        headers:{
            'Authorization':`Bearer ${token}`
        }
    });
    } catch (error) {
        console.error('Error create event organizer:', error.response || error);
    }
}

export const updateEventOrganizer = async(data,token) =>{
    try {
    return await axios.put(`${API_USER_URL}/event-organizer`,data,{
        headers:{
            'Authorization':`Bearer ${token}`
        }
    });
    } catch (error) {
        console.error('Error create event organizer:', error.response || error);
    }
}