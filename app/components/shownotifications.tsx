"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

import { app } from "@/firebaseConfig";

type Notification = { id: string; message: string; read: boolean };

export default function ShowNotifications() {
  const [rhUID, setRhUID] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // get current user
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      setRhUID(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  // fetch notifications when rhUID is set
  useEffect(() => {
    if (!rhUID) {
      setNotifications([]);
      return;
    }
    fetch(`/api/getNotifications?uid=${rhUID}`)
      .then((res) => res.json())
      .then((data: Notification[]) => {
        setNotifications(data);
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err);
        setNotifications([]);
      });
  }, [rhUID]);

  return (
    <div className="flex flex-col space-y-2 p-4">
      {notifications.length === 0 && (
        <p className="text-gray-500">No tienes notificaciones</p>
      )}
      {notifications.map(({ id, message }) => (
        <div
          key={id}
          className="border rounded p-2 bg-white shadow-sm hover:bg-gray-50"
        >
          {message}
        </div>
      ))}
    </div>
  );
}
