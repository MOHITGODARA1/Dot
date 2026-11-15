import Landing from "./Landing/landing.jsx";
import { useState } from "react";
import Login from "./Auth/login.jsx";
function App() {
  const [loginOpen, setLoginOpen] = useState(false)
  return (
      <>
        <Landing onGetStarted={() => setLoginOpen(true)} />
        <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
  )
}

export default App
