import axios from "axios";
import { BASE_URL } from "../../../config.js";

const REGISTER_URL = BASE_URL + "/user/register.php";

function getAuthHeaders() {
  const token = localStorage.getItem("Token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function registerUser(userData) {
  try {
    const formData = new FormData();
    formData.append("Name", userData.Name);
    formData.append("Contact", userData.Contact);
    formData.append("Table_Type", userData.Table_Type);
    formData.append("Number_of_People", userData.Number_of_People);
    formData.append("Gender", userData.Gender);
    formData.append("Hotel_Id", userData.Hotel_Id);
    const response = await axios.post(REGISTER_URL, formData, {
      headers: getAuthHeaders(),
      validateStatus: (status) => true,
    });

    console.log("Registered User :", response.data);

    if (response.data.Status) {
      localStorage.setItem("Name", userData.Name);
      localStorage.setItem("Contact", userData.Contact);
      localStorage.setItem("Table_Type", userData.Table_Type);
      localStorage.setItem("Number_of_People", userData.Number_of_People);
      localStorage.setItem("Gender", userData.Gender);
      localStorage.setItem("Hotel_Id", userData.Hotel_Id);
    }

    return response.data;
  } catch (error) {
    console.error("Error during registering user : ", error);
    throw error;
  }
}
