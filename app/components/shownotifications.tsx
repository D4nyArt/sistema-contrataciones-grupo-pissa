"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth } from "@/firebaseConfig";
import { Dot, Bookmark, BookmarkCheck } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Notification = {
  id: string;
  message: string;
  read: boolean;
  path: string;
  pinned: boolean;
};

export default function ShowNotifications() {
  const [rhUID, setRhUID] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read" | "saved">("all");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const pathname = usePathname();

  useEffect(() => {
    if (tabParam === "all" || tabParam === "unread" || tabParam === "read" || tabParam === "saved") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: "all" | "unread" | "read" | "saved") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
    setActiveTab(tab);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setRhUID(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function fetchNotifications() {
      if (!rhUID) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const res = await fetch(`/api/getNotifications?uid=${rhUID}`);
      const data = await res.json();
      setNotifications(data);
      setLoading(false);
    }
    fetchNotifications();
  }, [rhUID]);

  async function updateReadStatus(id: string) {
    await fetch(`/api/markNotificationRead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: rhUID, id }),
    });

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  const handleToggleSave = async (id: string, currentPinned: boolean) => {
    const newPinned = !currentPinned;

    await fetch("/api/markNotificationPinned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: rhUID, id, pinned: newPinned }),
    });

    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, pinned: newPinned } : notif
      )
    );
  };

  const filtered = [...notifications]
  .sort((a, b) => Number(b.id) - Number(a.id))
  .filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "read") return n.read;
    if (activeTab === "saved") return n.pinned;
    return true;
  });


  function tiempoNotificacion(timestamp: number): string {
    const ahora = Date.now();
    const diffMs = ahora - timestamp;

    const segundos = Math.floor(diffMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

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
        {["all", "unread", "read", "saved"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg cursor-pointer animate-fade-in-up ${
              activeTab === tab
                ? "bg-[#2d4583] text-white"
                : "bg-gray-200 hover:bg-[#08b177] hover:text-white"
            }`}
            onClick={() => handleTabChange(tab as typeof activeTab)}
          >
            {{
              all: "Todas",
              unread: "No leídas",
              read: "Leídas",
              saved: "Guardadas",
            }[tab]}
          </button>
        ))}
      </div>

      <div className="rounded-t-xl bg-gray-200 border-b border-gray-300 p-4 flex animate-fade-in-up">
        <h2 className="text-lg font-semibold text-[#495057]">
          {filtered.length} Notificaci
          {filtered.length === 1 ? "ón" : "ones"}
        </h2>
      </div>

      <div className="rounded-b-xl bg-white pb-6 animate-fade-in-up">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex items-center space-x-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-300 rounded-full" />
                <div className="w-6 h-6 bg-gray-300 rounded" />
                <div className="flex-1 h-4 bg-gray-300 rounded" />
                <div className="w-24 h-4 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center bg-white p-4 h-full rounded-b-xl">
            <p className="text-gray-500">
              No tienes notificaciones{" "}
              {{
                unread: "no leídas",
                read: "leídas",
                all: "registradas",
                saved: "guardadas",
              }[activeTab]}
              .
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <tbody>
                {filtered.map(({ id, message, read, path, pinned }) => (
                  <tr
                    key={id}
                    className="border-b border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <td>
                      <Dot className={read ? "text-gray-400 size-10" : "text-[#08b177] size-10"} />
                    </td>
                    <td>
                      <div className="flex justify-center items-center">
                        <button onClick={() => handleToggleSave(id, pinned)}>
                          {pinned ? (
                            <BookmarkCheck className="text-[#2d4583] cursor-pointer" />
                          ) : (
                            <Bookmark className="cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td
                      onClick={async () => {
                        await updateReadStatus(id);
                        router.push(`/${path}&from=${encodeURIComponent(pathname)}`);
                      }}
                      className="px-8"
                    >
                      {message}
                    </td>
                    <td className="text-sm text-gray-500">
                      {tiempoNotificacion(Number(id))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}