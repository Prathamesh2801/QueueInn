// src/api/CategoryAPI.js
import axios from "axios";
import { BASE_URL } from "../../../../config";
// 🔑 Get Token from localStorage
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

function getHotelIdAndUserRole() {
  const hotelId = localStorage.getItem("Hotel_ID") || null;
  const role = localStorage.getItem("Role");

  if (!role) {
    throw new Error("User role not found in localStorage");
  }
  return { hotelId, role };
}

export async function getHotelDetails() {
  try {
    const params = {};
    const { hotelId, role } = getHotelIdAndUserRole();

    if (role === "Super_Admin") {
      params.Hotel_ID = hotelId;
    }

    const response = await axios.get(`${BASE_URL}/superAdmin/hotel.php`, {
      headers: getAuthHeaders(),
      params,
      validateStatus: (status) => true,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching Hotel Details :", error);
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    throw error;
  }
}

export async function createHotelDetails(hotelData) {
  try {
    const formData = new FormData();
    formData.append("Category_Title", categoryData.Category_Title);
    formData.append("Gender", categoryData.Gender);
    if (categoryData.Category_Description) {
      formData.append(
        "Category_Description",
        categoryData.Category_Description
      );
    }
    if (categoryData.image) {
      formData.append("image", categoryData.image);
    }
    if (getShopIdAndUserRole().role === "Super_Admin") {
      formData.append("Shop_ID", getShopIdAndUserRole().shopId);
    }

    const response = await axios.post(
      `${BASE_URL}/admin/category.php`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("Create response FROM API :", response);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    throw error;
  }
}

// UPDATE Category (with FormData, supports partial updates)
export async function updateCategory(updateData) {
  try {
    const formData = new FormData();
    // Always include Category_ID
    formData.append("Category_ID", updateData.Category_ID);

    // Conditionally append fields (only if provided)
    if (updateData.Category_Title) {
      formData.append("Category_Title", updateData.Category_Title);
    }
    if (updateData.Category_Description) {
      formData.append("Category_Description", updateData.Category_Description);
    }
    if (updateData.Gender) {
      formData.append("Gender", updateData.Gender);
    }
    if (updateData.image) {
      formData.append("image", updateData.image);
    }

    // Add Shop_ID if Super_Admin
    if (getShopIdAndUserRole().role === "Super_Admin") {
      formData.append("Shop_ID", getShopIdAndUserRole().shopId);
    }

    const response = await axios.put(
      `${BASE_URL}/admin/category.php`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    throw error;
  }
}

/**
 * DELETE Category
 * @param {string} categoryId
 */
export async function deleteCategory(categoryId) {
  try {
    const { shopId, role } = getShopIdAndUserRole();

    // build params dynamically
    const params = { Category_ID: categoryId };

    if (role === "Super_Admin") {
      if (!shopId) {
        throw new Error(
          "Shop ID is required for Super_Admin to delete category"
        );
      }
      params.Shop_ID = shopId; // only add Shop_ID if Super_Admin
    }

    const response = await axios.delete(`${BASE_URL}/admin/category.php`, {
      headers: getAuthHeaders(),
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    throw error;
  }
}
