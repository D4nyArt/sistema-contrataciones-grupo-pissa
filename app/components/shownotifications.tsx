"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

import { auth } from "@/firebaseConfig";

type Notification = { id: string; message: string; read: boolean };

export default function ShowNotifications() {
  const [rhUID, setRhUID] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // get current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setRhUID(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  // fetch notifications when rhUID is set
  useEffect(() => {
    async function fetchNotifications() {
      if (!rhUID) {
        setNotifications([]);
        return;
      }

      const res = await fetch(`/api/getNotifications?uid=${rhUID}`);
      const data = await res.json();
      setNotifications(data);
    }
    fetchNotifications();
  }, [rhUID]);

  return (
    <div className="flex flex-col space-y-2 p-4">
      {notifications.length === 0 && (
        <p className="text-gray-500">No tienes notificaciones</p>
      )}
      {notifications.map(
        ({ id, message, read }) => (
          console.log(id, message, read),
          (
            <div
              key={id}
              className="border rounded p-2 bg-white shadow-sm hover:bg-gray-50"
            >
              {message}
            </div>
          )
        )
      )}
    </div>
  );
}
