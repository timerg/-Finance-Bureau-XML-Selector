import React from 'react'

export default ({errors}) =>
     errors.map((error, i) => <div key={i} className='errorsPrompt'>{error}</div>)
