import { Toaster } from "react-hot-toast"
import "./App.css"
import RootLayout from "./routes/RootLayout"
export default function App() {
  return (
    <>
     <Toaster position="top-center" reverseOrder={false} />
      <RootLayout />
    </>
  )
}
