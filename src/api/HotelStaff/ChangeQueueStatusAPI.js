// src/api/CategoryAPI.js
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

/**
 * payload example:
 * { Contact: "9867104527", Waiting: "calling" }
 * OR
 * { Contact: "9867104527", TimeChange: 10 }
 */
export async function updateQueueStatus(payload) {
  try {

    console.log("Updating Queue Status with payload:", payload);
    const response = await axios.put(QUEUE_URL, payload, {
      headers: getAuthHeaders(),
      validateStatus: (status) => true,
    });

    // Let caller handle status-specific logic but log for debugging
    console.log("Updated Queue Status", response.status, response.data);
    return response;
  } catch (error) {
    console.error("Error updating queue status :", error);
    // If axios couldn't get a response (network), bubble up
    throw error;
  }
}
