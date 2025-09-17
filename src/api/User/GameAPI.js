// src/api/CategoryAPI.js
import axios from "axios";
import { BASE_URL } from "../../../config";

const GAME_URL = BASE_URL + "/user/game.php";
const GAME_TRANSACTION_URL = BASE_URL + "/user/transaction.php";
const REDEEM_BY_SCANNER_URL = BASE_URL + "/device/user.php";

function getAuthHeaders() {
  const token = localStorage.getItem("Token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function playGame(hotelID) {
  try {
    const response = await axios.get(GAME_URL, {
      headers: getAuthHeaders(),
      params: {
        Hotel_ID: hotelID || localStorage.getItem("Hotel_ID") || "",
      },
      validateStatus: (status) => true,
    });

    console.log("Fetching Game Play Details ", response.data);

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching game Details :", error);

    throw error;
  }
}

export async function gameTransaction() {
  try {
    const response = await axios.get(GAME_TRANSACTION_URL, {
      headers: getAuthHeaders(),
      validateStatus: (status) => true,
    });

    console.log("Fetching Game Transaction Details ", response.data);

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching game transaction Details :", error);

    throw error;
  }
}
export async function gameRedeemByScanner(Transaction_ID, Device_ID) {
  try {
    const response = await axios.get(REDEEM_BY_SCANNER_URL, {
      headers: getAuthHeaders(),
      params: {
        Transaction_ID: Transaction_ID,
        Device_ID: Device_ID,
      },

      validateStatus: (status) => true,
    });

    console.log("Fetching the Redeem Data  ", response.data);

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching redeem details :", error);
    throw error;
  }
}
