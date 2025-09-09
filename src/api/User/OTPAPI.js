import axios from "axios";
import { BASE_URL } from "../../../config.js";

const OTP_URL = BASE_URL + "/user/otp.php";

export async function sendOTP(phoneNumber) {
  try {
    const formData = new FormData();
    formData.append("Phone_Number", phoneNumber);
    const response = await axios.post(OTP_URL, formData, {
      validateStatus: (status) => true,
    });

    console.log("Send OTP response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error during sending otp : ", error);
    throw error;
  }
}

export async function verifyOTP(phoneNumber, otp) {
  try {
    const formData = new FormData();
    formData.append("Phone_Number", phoneNumber);
    formData.append("Otp", otp);
    const response = await axios.post(OTP_URL, formData, {
      validateStatus: (status) => true,
    });

    if (response.data.Status) {
      localStorage.setItem("Token", response.data.Token);
    }
    console.log("Verify OTP response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error during verifying otp : ", error);
    throw error;
  }
}
