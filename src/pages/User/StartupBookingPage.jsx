import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';  // Import toast
import bannerMob from '../../assets/bannerMob.jpg';
import LoadingTransition from '../../components/ui/LoadingTransition';
import Beams from '../../components/ui/Beams';
import GradientButton from '../../components/ui/GradientButton';

const StartupBookingPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const Hotel_ID = searchParams.get('Hotel_ID');

    const navigate = useNavigate();

    // Check if Hotel_ID is missing and handle redirect with toast
    useEffect(() => {
        if (!Hotel_ID || typeof Hotel_ID !== 'string' || Hotel_ID.trim() === '') {
            toast.error("No Hotel ID is provided");
            navigate('/');
        } else {
            localStorage.setItem('Hotel_ID', Hotel_ID);
            console.log("Hotel_ID from query:", Hotel_ID);
        }
    }, [Hotel_ID, navigate]);

    const [isBooking, setIsBooking] = useState(false);

    const handleBooking = () => {
        setIsBooking(true);
        setTimeout(() => {
            navigate('/waitlistform');
        }, 2000);
    };

    const handleGaming = () => {
        setIsBooking(true);
        setTimeout(() => {
            navigate('/gameform');
        }, 2000);
    };

    return (
        <>
            {isBooking ? (
                <LoadingTransition
                    message="Preparing your culinary journey..."
                    subMessage="Diving deep into flavors"
                />
            ) : (
                <div className="min-h-screen relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                        <Beams
                            beamWidth={3}
                            beamHeight={30}
                            beamNumber={20}
                            lightColor="#ffffff"
                            speed={6}
                            noiseIntensity={1.75}
                            scale={0.2}
                            rotation={30}
                        />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-xs"></div>
                    <div className="relative z-10 min-h-screen flex flex-col">
                        <div className="flex justify-between items-center p-4 md:p-6 lg:p-8">
                            <div className="text-white text-lg md:text-xl font-medium">
                                DineSmart
                            </div>
                            <button className="p-2 rounded-full bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                                <Settings className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-8 lg:px-12 text-center">
                            <div className="max-w-md md:max-w-lg lg:max-w-xl space-y-6 md:space-y-8">
                                <div className="space-y-4 tracking-widest">
                                    <h1 className="text-3xl  md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                                        Welcome to DineSmart
                                    </h1>
                                    <p className="text-gray-300  text-base md:text-lg lg:text-xl font-light">
                                        Find your perfect dining experience
                                    </p>
                                </div>
                                <div className="pt-8 flex-col md:pt-12 ">
                                    <GradientButton
                                        text="Reserve Table"
                                        color="#1f2937"
                                        onClick={handleBooking}
                                        glow="#22d3ee"
                                        speed={2}
                                        className='mx-3 mb-10 bungee-regular'
                                    />
                                    <GradientButton
                                        text="Play Game"
                                        color="#1f2937"
                                        onClick={handleGaming}
                                        glow="#22d3ee"
                                        speed={2}
                                        className='mx-3 bungee-regular'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="h-16 md:h-20 lg:h-24"></div>
                    </div>
                    <div className="absolute top-1/4 left-4 w-32 h-32 bg-white bg-opacity-5 rounded-full blur-xl"></div>
                    <div className="absolute bottom-1/4 right-4 w-48 h-48 bg-blue-500 bg-opacity-10 rounded-full blur-2xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white bg-opacity-5 rounded-full blur-3xl"></div>
                </div>
            )}
        </>
    );
};

export default StartupBookingPage;
