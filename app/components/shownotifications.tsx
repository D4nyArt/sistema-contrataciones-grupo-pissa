"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth } from "@/firebaseConfig";
import { Trash } from "lucide-react";

type Notification = {
  id: string;
  message: string;
  read: boolean;
};

export default function ShowNotifications() {
  const [rhUID, setRhUID] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Get current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setRhUID(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  // Fetch notifications
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

  // Update read status
  async function updateReadStatus(id: string, read: boolean) {
    await fetch(`/api/updateNotificationReadStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, read }),
    });

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read } : n))
    );
  }

  async function markSelectedAsRead() {
    const updates = Array.from(selected).map((id) =>
      updateReadStatus(id, true)
    );
    await Promise.all(updates);
    setSelected(new Set());
  }

  async function markSelectedAsUnread() {
    const updates = Array.from(selected).map((id) =>
      updateReadStatus(id, false)
    );
    await Promise.all(updates);
    setSelected(new Set());
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      checked ? newSet.add(id) : newSet.delete(id);
      return newSet;
    });
  };

  const filtered = notifications.filter((n) =>
    activeTab === "unread" ? !n.read : n.read
  );

  function tiempoNotificacion(timestamp: number): string {
    const ahora = Date.now();
    const diffMs = ahora - timestamp;
  
    const segundos = Math.floor(diffMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas   = Math.floor(minutos / 60);
    const dias    = Math.floor(horas / 24);
  
    if (minutos < 1) return "Hace unos segundos";
    if (minutos < 60) return `Hace ${minutos} minuto${minutos !== 1 ? "s" : ""}`;
    if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? "s" : ""}`;
    if (dias < 7) return `Hace ${dias} día${dias !== 1 ? "s" : ""}`;
  
    const fecha = new Date(timestamp);
    return fecha.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded-lg cursor-pointer animate-fade-in-up ${
            activeTab === "unread"
              ? "bg-[#2d4583] text-white"
              : "bg-gray-200 hover:bg-[#08b177] hover:text-white"
          }`}
          onClick={() => {
            setActiveTab("unread");
            setSelected(new Set());
          }}
        >
          No leídas
        </button>
        <button
          className={`px-4 py-2 rounded-lg cursor-pointer animate-fade-in-up ${
            activeTab === "read"
              ? "bg-[#2d4583] text-white"
              : "bg-gray-200 hover:bg-[#08b177] hover:text-white"
          }`}
          onClick={() => {
            setActiveTab("read");
            setSelected(new Set());
          }}
        >
          Leídas
        </button>
      </div>

      <div className="rounded-t-xl bg-gray-200 border-b border-gray-300 p-4 flex animate-fade-in-up">
        <h2 className="text-lg font-semibold text-[#495057]">
          {filtered.length} Notificaci{filtered.length === 1 ? "ón" : "ones"} {activeTab === "unread" ? "no leída" : "leída"}
          {filtered.length !== 1 && "s"}
        </h2>

          {/* Botones según la pestaña activa */}
          {activeTab === "unread" && (
            <button
              disabled={selected.size === 0}
              onClick={markSelectedAsRead}
              className={`ml-auto ${
                selected.size === 0
                  ? "text-gray-600 bg-gray-300 rounded-lg px-4 cursor-not-allowed"
                  : "text-white bg-[#2d4583] rounded-lg px-4 hover:bg-[#08b177] cursor-pointer"
              }`}
            >
              Marcar como leída
            </button>
          )}
          {activeTab === "read" && (
            <button
              disabled={selected.size === 0}
              onClick={markSelectedAsUnread}
              className={`ml-auto ${
                selected.size === 0
                  ? "text-gray-600 bg-gray-300 rounded-lg px-4 cursor-not-allowed"
                  : "text-white bg-[#2d4583] rounded-lg px-4 hover:bg-[#08b177] cursor-pointer"
              }`}
            >
              Marcar como no leída
            </button>
          )}
        </div>

      {/* Notifications */}
      <div className="rounded-b-xl bg-white pb-6 animate-fade-in-up">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center bg-white p-4 h-full rounded-b-xl">
            <p className="text-gray-500">
              No tienes notificaciones {activeTab === "unread" ? "no leídas" : "leídas"}.
            </p>
          </div>
        ) : (
          filtered.map(({ id, message }) => (
            <div key={id}>
              <div className="pr-4 pl-4">
                <div className="border-b border-gray-300 pb-4 pt-4 flex space-x-10 items-center">
                  <input
                    type="checkbox"
                    checked={selected.has(id)}
                    onChange={(e) =>
                      handleCheckboxChange(id, e.target.checked)
                    }
                    className="cursor-pointer accent-[#2d4583] size-4"
                  />
                  <p>{message}</p>
                  <p className="text-sm text-gray-500">
                    {tiempoNotificacion(Number(id))}
                  </p>
                  <button className="ml-auto text-red-500 cursor-pointer"><Trash/></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}