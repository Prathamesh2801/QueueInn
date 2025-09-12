import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import WaitListFormUI from '../../components/waitlist/WaitListFormUI'
import VerifyOTP from '../../components/waitlist/VerifyOTP'
import PremiumRestaurantLoading from '../../components/ui/PremiumRestaurantLoading'
import { sendOTP, verifyOTP } from '../../api/User/OTPAPI'
import { registerUser } from '../../api/User/RegisterAPI'
import toast from 'react-hot-toast'

export default function WaitListForm() {
  const [currentStep, setCurrentStep] = useState('form') // 'form', 'otp', 'loading'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const navigate = useNavigate()

  // Check if user has token on component mount
  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (token) {
      // User already has token, can directly submit form
      setCurrentStep('form');
    } else {
      // User needs to verify OTP first
      setCurrentStep('form');
    }
  }, []);

  const handleFormSubmit = async (userData) => {
    setFormData(userData);
    setPhoneNumber(userData.Contact);

    const token = localStorage.getItem("Token");

    if (token) {
      // User has token, directly register
      await handleRegisterUser(userData);
    } else {
      // User needs OTP verification first
      try {
        setIsSubmitting(true);
        const otpResponse = await sendOTP(userData.Contact);

        if (otpResponse.Status) {
          setCurrentStep('otp');
        } else {
          toast.error(otpResponse.Message || 'Failed to send OTP. Please try again.');
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        toast.error('Failed to send OTP. Please check your connection and try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOTPVerification = async (phoneNum, otp) => {
    try {
      const verifyResponse = await verifyOTP(phoneNum, otp);

      if (verifyResponse.Status) {
        // OTP verified successfully, now register user
        await handleRegisterUser(formData);
      } else {
        throw new Error(verifyResponse.Message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error; // Re-throw to handle in VerifyOTP component
    }
  };

  const handleRegisterUser = async (userData) => {
    try {
      setCurrentStep('loading');

      // Ensure Hotel_Id is available
      const hotelId = localStorage.getItem("Hotel_ID");
      if (!hotelId) {
        toast.error('Hotel information not found. Please try again.');
        setCurrentStep('form');
        return;
      }

      const registerResponse = await registerUser(userData);

      if (registerResponse.Status) {
        // Registration successful, navigate to wait area
        setTimeout(() => {
          navigate('/waitarea', {
            state: userData
          });
        }, 2000); // Show loading for 3 seconds
      } else {
        toast.error(registerResponse.Message || 'Registration failed. Please try again.');
        setCurrentStep('form');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error('Registration failed. Please check your connection and try again.');
      setCurrentStep('form');
    }
  };

  const handleResendOTP = async (phoneNum) => {
    try {
      const otpResponse = await sendOTP(phoneNum);

      if (!otpResponse.Status) {
        throw new Error(otpResponse.Message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error; // Re-throw to handle in VerifyOTP component
    }
  };

  const handleBackFromOTP = () => {
    setCurrentStep('form');
    setIsSubmitting(false);
  };

  // Render different components based on current step
  if (currentStep === 'loading') {
    return <PremiumRestaurantLoading />;
  }

  if (currentStep === 'otp') {
    return (
      <VerifyOTP
        phoneNumber={phoneNumber}
        onVerifySuccess={handleOTPVerification}
        onBack={handleBackFromOTP}
        onResendOTP={handleResendOTP}
      />
    );
  }

  return (
    <WaitListFormUI
      onSubmit={handleFormSubmit}
      isSubmitting={isSubmitting}
    />
  );
}