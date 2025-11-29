import MainNavigation from '../components/ui/Visuals/MainNavigation'
import HeroScene1 from '../components/ui/Scenes/HeroScene1'
import HeroScene2 from '../components/ui/Scenes/HeroScene2'
import HeroScene3 from '../components/ui/Scenes/HeroScene3'
import HeroScene4 from '../components/ui/Scenes/HeroScene4'
import Footer from '@/components/ui/Visuals/Footer'

export default function LandingPage() {
  return (
   <>
     <MainNavigation />
     <HeroScene1 />
     <HeroScene2/>
     <HeroScene3/>
     <HeroScene4/>
     <Footer/>
   </>
  )
}
