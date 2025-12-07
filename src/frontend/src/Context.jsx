import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
export const ContextAPI = createContext();
const Context = (props) => {
  
  return (

        <ContextAPI.Provider value = {{
          
        }}>
           {props.children}
        </ContextAPI.Provider>
    
  )
}

export default Context