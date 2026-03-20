"use client"
import React, { createContext, useState } from "react";
import { Usuario } from "../model/usuario";

export const UserContext = createContext<{ userData?: Usuario, setUserData:Function}>({
  setUserData: () => {},
});


export const UserContextProvider = ({ children }: { children: React.ReactNode}):React.ReactNode => {
  const [userData, setUserData] = useState();

  return (
    <UserContext.Provider value={{userData,setUserData}}>
      {children}
    </UserContext.Provider>
  );
}