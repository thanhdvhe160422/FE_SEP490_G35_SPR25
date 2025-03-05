import axios from "axios";

const API_URL = "http://localhost:4000/events";
const API_EVENT_DETAIL_SPEC = "https://localhost:44320/api/EventForSpectators";

const getPosts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};
export const getEventDetailSpec = async(eventId) =>{
  try{
    const response = await axios.get(API_EVENT_DETAIL_SPEC+'/'+eventId);
    return response.data;
  }catch(error){
    console.error("Error fetching event detail spectator: ", error);
    return [];
  }
}

export default getPosts;
