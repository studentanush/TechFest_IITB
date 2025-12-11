import { createContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

import { playerSocket } from "./socket";

// we for now using ContextAPI for state management later we can upgrade it to redux(i dont think we need too )
// bcoz it is used for larger apps which has to do with lot of state variables

export const ContextAPI = createContext();
const Context = (props) => {
   const [studentData,setStudentData] = useState({});
    const [educatorData,setEducatorData] = useState({});
    const loginBro = (userDetails) =>{
        if(userDetails.role=='educator'){
            sessionStorage.removeItem('edu_info');
          sessionStorage.setItem('edu_info',JSON.stringify(userDetails));
          setEducatorData(userDetails);
      }else{
           sessionStorage.setItem('stu_info', JSON.stringify(userDetails));
            setStudentData(userDetails);
      }
      
     
    }
   useEffect(()=>{
    console.log("heher in context")
    
        const stuDetails = sessionStorage.getItem('stu_info');
        if(stuDetails){
            const parseData = JSON.parse(stuDetails);
            console.log(parseData)
            setStudentData(parseData);
        }
        const eduDetails = sessionStorage.getItem('edu_info');
        if(eduDetails){
            const parseData = JSON.parse(eduDetails);
            setEducatorData(parseData);
        }
     
   },[])
   const logoutStudent = () => {
        setStudentData(null);
        sessionStorage.removeItem('stu_info');
       
    };
    return (

        <ContextAPI.Provider value={{
          studentData,
          setStudentData,
          educatorData,
          setEducatorData,
          logoutStudent,
          loginBro
            
        }}>
            {props.children}
        </ContextAPI.Provider>

    )
}

export default Context