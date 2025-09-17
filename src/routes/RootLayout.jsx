import { HashRouter, Routes, Route } from 'react-router-dom'
import StartupBookingPage from '../pages/User/StartupBookingPage'
import WaitListForm from '../pages/User/WaitListForm'
import WaitArea from '../pages/User/WaitArea'
import GameZoneArea from '../pages/User/GameZoneArea'
import Dashboard from '../pages/SuperAdmin/Dashboard'
import ProtectedRoutes from './ProtectedRoutes'
import Login from '../pages/Login'
import HADashboard from '../pages/HotelAdmin/HADashboard'
import HS_Dashboard from '../pages/HotelStaff/HS_Dashboard'
import PageNotFound from '../pages/PageNotFound'
import GameForm from '../pages/User/GameForm'
import GameHistory from '../pages/User/GameHistory'
import GameRedeemArea from '../pages/User/GameRedeemArea'
export default function RootLayout() {
    return (
        <HashRouter>
            <Routes>
                <Route path='*' element={<PageNotFound />} />
                <Route path='/startup' element={<StartupBookingPage />} />
                <Route path='/waitlistform' element={<WaitListForm />} />
                <Route path='/waitarea' element={<WaitArea />} />
                <Route path='/gameform' element={<GameForm />} />
                <Route path='/gamezone' element={<GameZoneArea />} />
                <Route path='/history' element={<GameHistory />} />
                <Route path='/redeem/:transactionID' element={<GameRedeemArea />} />
                <Route path='/login' element={<Login />} />
                <Route path='/sa/dashboard' element={<ProtectedRoutes>
                    <Dashboard />
                </ProtectedRoutes>} />
                <Route path='/hotelAdmin/dashboard' element={<ProtectedRoutes>
                    <HADashboard />
                </ProtectedRoutes>} />
                <Route path='/hotelStaff/dashboard' element={<ProtectedRoutes>
                    <HS_Dashboard />
                </ProtectedRoutes>} />
            </Routes>
        </HashRouter>
    )
}
