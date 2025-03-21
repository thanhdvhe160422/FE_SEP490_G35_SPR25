import axios from "axios";

const API_PROFILE_URL = 'https://localhost:44320/api/Profiles';

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