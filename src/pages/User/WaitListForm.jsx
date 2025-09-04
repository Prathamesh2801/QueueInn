import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WaitListFormUI from '../../components/waitlist/WaitListFormUI'
import LoadingTransition from '../../components/ui/LoadingTransition'
import PremiumRestaurantLoading from '../../components/ui/PremiumRestaurantLoading'

export default function WaitListForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleFormSubmit = (formData) => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      navigate('/waitarea', {
        state: {
          userData: formData,
          waitingNumber: 2 // dummy number
        }
      })
    }, 5000)
  }

  return (
    <>
      {isSubmitting ? (
        <PremiumRestaurantLoading  />
      ) : (
        <WaitListFormUI onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
      )}
    </>
  )
}
