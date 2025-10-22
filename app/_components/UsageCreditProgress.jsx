import React from 'react'
import { progress } from  '@/components/ui/progress'

function UsageCreditProgress() {
  return (
    <div className='p-3 border rounded-2xl mb-5 flex-col gap-2'>
        <h2 className='font-bold text-xl'>Free Paln</h2>
    <p className='text-gray-400'>0/5 message Used</p>
    <progress value={33} />
    </div>
    
  )
}

export default UsageCreditProgress