import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import StartupBookingPage from '../pages/User/StartupBookingPage'
import WaitListForm from '../pages/User/WaitListForm'
import WaitArea from '../pages/User/WaitArea'
import GameZoneArea from '../pages/User/GameZoneArea'
import Login from '../pages/SuperAdmin/Login'
import Dashboard from '../pages/SuperAdmin/Dashboard'
import ProtectedRoutes from './ProtectedRoutes'
export default function RootLayout() {
    return (
        <HashRouter>
            <Routes>
                <Route path='/startup' element={<StartupBookingPage />} />
                <Route path='/waitlistform' element={<WaitListForm />} />
                <Route path='/waitarea' element={<WaitArea />} />
                <Route path='/gamezone' element={<GameZoneArea />} />
                <Route path='/login' element={<Login />} />
                <Route path='/sa/dashboard' element={<ProtectedRoutes>
                    <Dashboard />
                </ProtectedRoutes>} />
            </Routes>
        </HashRouter>
    )
}
