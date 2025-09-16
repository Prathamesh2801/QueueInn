// src/api/CategoryAPI.js
import axios from "axios";
import { BASE_URL } from "../../../config";

const GAME_URL = BASE_URL + "/user/game.php";

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
        hotel_id: hotelID || localStorage.getItem("Hotel_ID") || "",
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
