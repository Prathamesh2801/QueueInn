import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import StartupBookingPage from '../pages/StartupBookingPage'
import WaitListForm from '../pages/WaitListForm'
import WaitArea from '../pages/WaitArea'
import GameZoneArea from '../pages/GameZoneArea'
export default function RootLayout() {
    return (
        <HashRouter>
            <Routes>
                <Route path='*' element={<StartupBookingPage />} />
                <Route path='/waitlistform' element={<WaitListForm />} />
                <Route path='/waitarea' element={<WaitArea />} />
                <Route path='/gamezone' element={<GameZoneArea />} />
            </Routes>
        </HashRouter>
    )
}
