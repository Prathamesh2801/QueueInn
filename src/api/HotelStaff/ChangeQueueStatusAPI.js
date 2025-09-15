// src/api/HotelStaff/ChangeQueueStatusAPI.js
import axios from "axios";
import { BASE_URL } from "../../../config";

const QUEUE_URL = BASE_URL + "/hotelStaff/queue.php";

function getAuthHeaders() {
  const token = localStorage.getItem("Token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
}

export async function updateQueueStatus(payload) {
  try {
    console.log("Updating Queue Status with payload:", payload);
    console.log("Auth headers:", getAuthHeaders());

    // timeout set to 10s (adjust if needed)
    const response = await axios.put(QUEUE_URL, payload, {
      headers: getAuthHeaders(),
      timeout: 10000,         // <-- important: prevents hanging requests
      validateStatus: (status) => true,
    });

    console.log("Updated Queue Status", response.status, response.data);
    return response;
  } catch (error) {
    // Differentiate timeout vs network vs server
    if (error.code === "ECONNABORTED") {
      console.error("updateQueueStatus: request timed out", error);
      throw new Error("timeout");
    }
    console.error("Error updating queue status :", error);
    throw error;
  }
}
