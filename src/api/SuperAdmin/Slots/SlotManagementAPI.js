// src/api/CategoryAPI.js
import axios from "axios";
import { BASE_URL } from "../../../../config";

const SLOT_URL = BASE_URL + "/superAdmin/slot.php";

function getAuthHeaders() {
  const token = localStorage.getItem("Token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getSlotDetails(filters = {}) {
  try {
    const response = await axios.get(SLOT_URL, {
      headers: getAuthHeaders(),
      params: {
        Device_ID: filters.Device_ID,
        Slot_ID: filters.Slot_ID,
      },
      validateStatus: (status) => true,
    });

    console.log("Fetch Slot Details", response.data);

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching Slot Details:", error);
    throw error;
  }
}

export async function createSlotDetails(slotData) {
  try {
    const formData = new FormData();
    formData.append("Device_ID", slotData.Device_ID);
    formData.append("Remain_Product", slotData.Remain_Product);

    const response = await axios.post(SLOT_URL, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
      validateStatus: (status) => true,
    });
    console.log("Create Slot details:", response.data);
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    return response.data;
  } catch (error) {
    console.error("Error creating Slot Details:", error);
    throw error;
  }
}

export async function updateSlotDetails(slotUpdatedData) {
  try {
    const payload = {
      Slot_ID: slotUpdatedData.Slot_ID,
      Remain_Product: slotUpdatedData.Remain_Product,
    };

    const response = await axios.put(SLOT_URL, payload, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      validateStatus: (status) => true,
    });

    console.log("Update Slot Details", response.data);
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    return response.data;
  } catch (error) {
    console.error("Error updating Slot Details:", error);
    throw error;
  }
}


export async function deleteSlotDetails(slotID) {
  try {
    const params = { Slot_ID: slotID };

    console.log("Deleting Slot Details with params:", params);
    const response = await axios.delete(SLOT_URL, {
      headers: getAuthHeaders(),
      params,
    });

    console.log("Deleting Slot Details", response.data);
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    return response.data;
  } catch (error) {
    console.error("Error deleting Slot Details:", error);
    throw error;
  }
}
