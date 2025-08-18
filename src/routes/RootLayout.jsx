import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import StartupBookingPage from '../pages/StartupBookingPage'
import WaitListForm from '../pages/WaitListForm'
import WaitArea from '../pages/WaitArea'
import GameZoneArea from '../pages/GameZoneArea'
import { SALoginForm } from '../pages/SuperAdmin/SALoginForm'
import Dashboard from '../pages/SuperAdmin/Dashboard'
export default function RootLayout() {
    return (
        <HashRouter>
            <Routes>
                <Route path='*' element={<StartupBookingPage />} />
                <Route path='/waitlistform' element={<WaitListForm />} />
                <Route path='/waitarea' element={<WaitArea />} />
                <Route path='/gamezone' element={<GameZoneArea />} />
                <Route path='/superadmin/login' element={<SALoginForm />} />
                <Route path='/superadmin/dashboard' element={<Dashboard />} />
            </Routes>
        </HashRouter>
    )
}
