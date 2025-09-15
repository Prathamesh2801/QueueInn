// src/api/CategoryAPI.js
import axios from "axios";
import { BASE_URL } from "../../../../config";

const GAME_URL = BASE_URL + "/superAdmin/game.php";

function getAuthHeaders() {
  const token = localStorage.getItem("Token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getGameDetails(filters = {}) {
  try {
    const response = await axios.get(GAME_URL, {
      headers: getAuthHeaders(),
      params: {
        Game_ID: filters.Game_ID,
        Reward_Type: filters.Reward_Type,
        Location: filters.Location,
      },
      validateStatus: (status) => true,
    });

    console.log("Fetch Game Details ", response.data);

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching Game Details :", error);
    throw error;
  }
}

export async function createGameDetails(gameData) {
  try {
    const formData = new FormData();
    formData.append("Game_Name", gameData.Game_Name);
    formData.append("Reward_Type", gameData.Reward_Type);
    formData.append("Location", gameData.Location);

    const response = await axios.post(GAME_URL, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
      validateStatus: (status) => true,
    });
    console.log("Create Game details :", response.data);
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    return response.data;
  } catch (error) {
    console.error("Error creating Hotel Details :", error);
    throw error;
  }
}

export async function updateGameDetails(gameUpdatedData) {
  try {
    const payload = {
      Game_ID: gameUpdatedData.Game_ID,
      Game_Name: gameUpdatedData.Game_Name,
      Reward_Type: gameUpdatedData.Reward_Type,
      Location: gameUpdatedData.Location,
    };

    const response = await axios.put(GAME_URL, payload, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      validateStatus: (status) => true,
    });

    console.log("Update Game Details ", response.data);
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    return response.data;
  } catch (error) {
    console.error("Error updating Game Details :", error);

    throw error;
  }
}


export async function deleteGameDetails(gameID) {
  try {
    const params = { Game_ID: gameID };

    console.log("Deleting Game Details with params:", params);
    const response = await axios.delete(GAME_URL, {
      headers: getAuthHeaders(),
      params,
    });

    console.log("Deleting Game Details ", response.data);
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    return response.data;
  } catch (error) {
    console.error("Error deleting Game Details :", error);
    throw error;
  }
}
