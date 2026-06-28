'use client'
import Navbar from '@/components/landing/navbar'
import Hero from '@/components/landing/hero'
import ProblemSolution from '@/components/landing/problem-solution'
import HowItWorks from '@/components/landing/how-it-works'
import Features from '@/components/landing/features'
import Stats from '@/components/landing/stats'
import Testimonials from '@/components/landing/testimonials'
import FinalCTA from '@/components/landing/final-cta'

export default function Home() {
  return (
    <div className="bg-[#030303]">
      <Navbar />
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <Features />
      <Stats />
      <Testimonials />
      <FinalCTA />
    </div>
  )
}
