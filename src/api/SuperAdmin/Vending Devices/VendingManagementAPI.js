// src/api/CategoryAPI.js
import axios from "axios";
import { BASE_URL } from "../../../../config";

const VENDING_URL = BASE_URL + "/superAdmin/device.php";

function getAuthHeaders() {
  const token = localStorage.getItem("Token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getVendingDeviceDetails(filters = {}) {
  try {
    const response = await axios.get(VENDING_URL, {
      headers: getAuthHeaders(),
      params: {
        Location: filters.Location,
        Device_ID: filters.Device_ID,
      },
      validateStatus: (status) => true,
    });

    console.log("Fetch Vending Device Details", response.data);

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching Vending Device Details:", error);
    throw error;
  }
}

export async function createVendingDeviceDetails(deviceData) {
  try {
    const formData = new FormData();
    formData.append("Hotel_ID", deviceData.Hotel_ID);
    formData.append("Location", deviceData.Location);
    formData.append("Name", deviceData.Name);

    const response = await axios.post(VENDING_URL, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
      validateStatus: (status) => true,
    });
    console.log("Create Vending Device details:", response.data);
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    return response.data;
  } catch (error) {
    console.error("Error creating Vending Device Details:", error);
    throw error;
  }
}

export async function updateVendingDeviceDetails(deviceUpdatedData) {
  try {
    const payload = {
      Device_ID: deviceUpdatedData.Device_ID,
      Hotel_ID: deviceUpdatedData.Hotel_ID,
      Location: deviceUpdatedData.Location,
      Name: deviceUpdatedData.Name,
    };

    const response = await axios.put(VENDING_URL, payload, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      validateStatus: (status) => true,
    });

    console.log("Update Vending Device Details", response.data);
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    return response.data;
  } catch (error) {
    console.error("Error updating Vending Device Details:", error);
    throw error;
  }
}

export async function deleteVendingDeviceDetails(deviceID) {
  try {
    const params = { Device_ID: deviceID };

    console.log("Deleting Vending Device Details with params:", params);
    const response = await axios.delete(VENDING_URL, {
      headers: getAuthHeaders(),
      params,
    });

    console.log("Deleting Vending Device Details", response.data);
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    return response.data;
  } catch (error) {
    console.error("Error deleting Vending Device Details:", error);
    throw error;
  }
}
