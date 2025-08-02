import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import bannerMob from '../assets/bannerMob.jpg'
import { useNavigate } from 'react-router-dom';
import LoadingTransition from '../components/ui/LoadingTransition';
import CustomButton from '../components/ui/CustomButton';
import Particles from '../components/ui/Particles';
import Squares from '../components/ui/Squares';
import Hyperspeed from '../components/ui/HyperSpeed';
import Beams from '../components/ui/Beams';
import ShinyText from '../components/ui/ShinyText';

const StartupBookingPage = () => {
    const [isBooking, setIsBooking] = useState(false)
    const navigate = useNavigate()

    const handleBooking = () => {
        setIsBooking(true)

        // Simulate API call
        setTimeout(() => {
            navigate('/waitlistform')
        }, 5000)
    }
    return (
        <>
            {isBooking ? (<LoadingTransition message="Preparing your culinary journey..."
                subMessage="Diving deep into flavors" />) :
                <div className="min-h-screen relative overflow-hidden">
                    {/* Background Image Container - You can replace this with your actual background image */}
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


                    {/* Glass Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-xs"></div>

                    {/* Content Container */}
                    <div className="relative z-10 min-h-screen flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 md:p-6 lg:p-8">
                            <div className="text-white text-lg md:text-xl font-medium">
                                DineSmart
                            </div>
                            <button className="p-2 rounded-full bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                                <Settings className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-8 lg:px-12 text-center">
                            <div className="max-w-md md:max-w-lg lg:max-w-xl space-y-6 md:space-y-8">
                                {/* Welcome Text */}
                                <div className="space-y-4 tracking-widest">
                                    <h1 className="text-3xl  md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                                        Welcome to DineSmart
                                    </h1>
                                    <p className="text-gray-300  text-base md:text-lg lg:text-xl font-light">
                                        Find your perfect dining experience
                                    </p>
                                </div>

                                {/* CTA Button */}
                                <div className="pt-8 flex-col md:pt-12" >


                                    <button onClick={handleBooking} className="w-4/5   max-w-sm mx-auto relative inline-flex h-12 overflow-hidden rounded-2xl p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-b from-white via-gray-200 to-gray-400 px-3 py-1 text-sm font-medium  backdrop-blur-3xl">
                                            <ShinyText text="Reserve Table" disabled={false} speed={3} className='custom-class' />
                                        </span>
                                    </button>

                                </div>
                            </div>
                        </div>

                        {/* Bottom Spacing */}
                        <div className="h-16 md:h-20 lg:h-24"></div>
                    </div>

                    {/* Additional Glass Elements for Enhanced Effect */}
                    <div className="absolute top-1/4 left-4 w-32 h-32 bg-white bg-opacity-5 rounded-full blur-xl"></div>
                    <div className="absolute bottom-1/4 right-4 w-48 h-48 bg-blue-500 bg-opacity-10 rounded-full blur-2xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white bg-opacity-5 rounded-full blur-3xl"></div>
                </div>
            }
        </>
    );
};

export default StartupBookingPage;