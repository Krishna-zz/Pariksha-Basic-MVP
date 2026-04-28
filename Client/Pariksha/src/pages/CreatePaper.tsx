import React, { useState } from 'react'
import API from '../api/api'

const CreatePaper = () => {

  const [title , setTitle] = useState("");     //this is to write paper's title

  const handleSubmit = async() => {
      await API.post("/papers",{
        title, 
        questions:[]
      })
      alert("Paper created")
  }

  return (
    <div>
       <input type="text" 
       placeholder='Title'
       value={title}
       onChange={(e) => setTitle(e.target.value)}/>
       <button>Create</button>
    </div>
  )
}

export default CreatePaper
