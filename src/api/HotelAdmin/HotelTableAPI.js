// src/api/CategoryAPI.js
import axios from "axios";
import { BASE_URL } from "../../../config";

const HOTEL_TABLE_URL = BASE_URL + "/hotelAdmin/table.php";

function getAuthHeaders() {
  const token = localStorage.getItem("Token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getHotelTableDetails(filters = {}) {
  try {
    const response = await axios.get(HOTEL_TABLE_URL, {
      headers: getAuthHeaders(),
      params: {
        Hotel_ID: filters.Hotel_ID || localStorage.getItem("Hotel_ID") || "",
      },
      validateStatus: (status) => true,
    });

    console.log("Fetch Hotel Table Details ", response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching Hotel Table Details :", error);
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    throw error;
  }
}

export async function createHotelTableDetails(hotelData) {
  try {
    const formData = new FormData();
    formData.append(
      "Hotel_ID",
      hotelData.Hotel_ID || localStorage.getItem("Hotel_ID") || ""
    );
    formData.append("TableSize", hotelData.TableSize);
    formData.append("TableType", hotelData.TableType);

    const response = await axios.post(HOTEL_TABLE_URL, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
      validateStatus: (status) => true,
    });
    console.log("Create Hotel Table details :", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating Hotel Table Details :", error);
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    throw error;
  }
}

export async function deleteHotelTableDetails(SrNo) {
  try {
    const params = { SR_NO: SrNo };

    const response = await axios.delete(HOTEL_TABLE_URL, {
      headers: getAuthHeaders(),
      params,
    });

    console.log("Deleting Hotel Details ", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting Hotel Details :", error);
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    throw error;
  }
}
