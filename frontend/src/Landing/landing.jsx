import Navbar from './component/Navbar.jsx'
import Hero from './component/Hero.jsx'
import Features from './component/Features.jsx'
import HowItWorks from './component/HowItWorks.jsx'
import BuildNote from './component/BuildNote.jsx'
import Footer from './component/Footer.jsx'

export default function Landing({ onGetStarted }) {
  return <div className="overflow-hidden bg-ivory font-sans text-navy"><Navbar onGetStarted={onGetStarted} /><main><Hero onGetStarted={onGetStarted} /><Features /><HowItWorks /><BuildNote /></main><Footer /></div>
}
