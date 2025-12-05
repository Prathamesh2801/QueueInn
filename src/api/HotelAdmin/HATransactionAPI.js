// src/api/HotelAdmin/HATransactionAPI.js
import axios from "axios";
import { BASE_URL } from "../../../config"; // keep same pattern as HotelTableAPI

const HOTEL_TRANSACTION_URL = BASE_URL + "/hotelAdmin/transaction.php";

function getAuthHeaders() {
  const token = localStorage.getItem("Token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * ✅ REAL API – FETCH TRANSACTION LIST
 * Uses:
 *   - Hotel_ID from localStorage by default
 *   - Optional filters: Game_ID, Transaction_Type
 */
export async function getHotelTransactionDetails(filters = {}) {
  try {
    const response = await axios.get(HOTEL_TRANSACTION_URL, {
      headers: getAuthHeaders(),
      params: {
        Hotel_ID: filters.Hotel_ID || localStorage.getItem("Hotel_ID") || "",
        Game_ID: filters.Game_ID || "",
        Transaction_Type: filters.Transaction_Type || "",
        // In future you can add: FromDate, ToDate, etc.
      },
      validateStatus: (status) => true,
    });

    console.log("Fetch Hotel Transaction Details:", response.data);

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching Hotel Transaction Details:", error);
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    throw error;
  }
}

/**
 * ⏳ PLACEHOLDER – will use when POST API is ready
 */
export async function createHotelTransaction(transactionData) {
  console.warn("createHotelTransaction: API not implemented yet");
  return Promise.reject(new Error("Create transaction API not available yet"));
}

/**
 * ⏳ PLACEHOLDER – will use when UPDATE API is ready
 */
export async function updateHotelTransaction(logId, transactionData) {
  console.warn("updateHotelTransaction: API not implemented yet");
  return Promise.reject(new Error("Update transaction API not available yet"));
}

/**
 * ⏳ PLACEHOLDER – will use when DELETE API is ready
 */
export async function deleteHotelTransaction(logId) {
  console.warn("deleteHotelTransaction: API not implemented yet");
  return Promise.reject(new Error("Delete transaction API not available yet"));
}

/**
 * ⏳ Optional getter by ID – future use
 */
export async function getHotelTransactionById(logId) {
  console.warn("getHotelTransactionById: API not implemented yet");
  return Promise.reject(new Error("Get transaction by ID not available yet"));
}
