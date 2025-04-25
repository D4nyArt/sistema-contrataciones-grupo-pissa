"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams} from "next/navigation";
import {database} from "../../firebaseConfig"
import {ref, get, set} from "firebase/database"
import path from "path";
import ProfilePicture from "./profile-picture";
import { CircleCheck, Ellipsis, MoveLeft, Lock, CircleUser, Mail, Phone } from "lucide-react";
import { urbanist } from "./fonts";

interface User {
  id: string;
  nombre?: string;
  apellidos?: string;
  rol?: string;
  email?: string;
  telefono?: string;
}

export default function phoneUsuarios() {
  const router = useRouter();
  const pathname = usePathname();
  const searchparams = useSearchParams();
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const id =  pathname.split("/")[2];


  const handleRemoval = async () => {

    //console.log("something is happening")
    await set(ref(database, `usuarios/${id}/estadoUsuario`), "dado de baja").then(() => {

      setStatus("dado de baja");
    })
  
    
  }

  const handleBlock = async () => {

    if (status != "dado de baja") {
    await set(ref(database, `usuarios/${id}/estadoUsuario`), "bloqueado").then(() => {

      setStatus("bloqueado");
    })
  }
  else {
    alert("No se puede bloquear un usuario que ya esta dado de baja.");
  }

  }

  const handleUnblock = async () => {


    if (status != "dado de baja") {
    
      
    await set(ref(database, `usuarios/${id}/estadoUsuario`), "normal").then(() => {

      setStatus("normal");
    })

  }
  else {
    alert("No se puede desbloquear un usuario que esta dado de baja.")
  }
  }

  useEffect(() => {
    //get(ref(database, `usuarios/${id}`))
     
     const fetchUser = async () => {
          try {
            
            let snapshot_buffer = (await get(ref(database, `usuarios/${id}`))).child('apellidos').val();
            setLastname(snapshot_buffer);
            snapshot_buffer = (await get(ref(database, `usuarios/${id}`))).child('nombre').val();
            setName(snapshot_buffer);
            snapshot_buffer = (await get(ref(database, `usuarios/${id}`))).child('email').val();
            setMail(snapshot_buffer);
            snapshot_buffer = (await get(ref(database, `usuarios/${id}`))).child('telefono').val();
            setPhone(snapshot_buffer);
            snapshot_buffer = (await get(ref(database, `usuarios/${id}`))).child('rol').val();
            setRole(snapshot_buffer);
            snapshot_buffer = (await get(ref(database, `usuarios/${id}`))).child('estadoUsuario').val();
            setStatus(snapshot_buffer);
            
          }
        
        catch (e){
          console.error(e);
        }
      }
      fetchUser();
      }, []);
 
  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between">
        <a href="/dashboard/personas"><MoveLeft/></a>
        <h1 className={`${urbanist.className} text-2xl text-[#212529]`}><strong>Perfil</strong></h1>
        <Ellipsis/>
      </div>
      <div className="flex flex-col items-center justify-center pt-10">
        <ProfilePicture nombre={`${name}`} width={"w-25"} height={"h-25"} textSize={"text-5xl"}/>
        <div className="flex flex-row items-center pt-8">
          <h2 className={`${urbanist.className} text-3xl text-[#212529]`}><strong>{name} {lastname}</strong></h2>
          <div className="pl-2">
            <div className="flex flex-row items-center">
              {status === "normal" && (
                <CircleCheck className="size-4 text-green-800" />
              )}
              {status === "bloqueado" && (
                <Lock className="size-4 text-red-800" />
              )}
            </div>
          </div>
        </div>
        <p className="text-[#2975a0] text-xl">{role}</p>
        <div className="items-center flex justify-center flex-col text-sm">
          <p className="inline-flex gap-2 px-2 py-0.5 bg-gray-200 rounded mt-4"><CircleUser className="size-4"/>{id}</p>
          <p className="inline-flex gap-2 px-2 py-0.5 bg-gray-200 rounded mt-2"><Mail className="size-4"/>{mail}</p>
          <p className="inline-flex gap-2 px-2 py-0.5 bg-gray-200 rounded mt-2"><Phone className="size-4"/>{phone}</p>
        </div>
      </div>
    </div>
  );
  
}