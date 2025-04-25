"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function SideBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sidebar Toggle Button (Visible on Mobile) */}
      <button
        className="md:hidden fixed top-4 left-4 bg-gray-800 text-white p-2 rounded z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-blue-900 text-white p-4 w-40 transition-transform duration-300 z-49 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:fixed md:flex-none md:w-64`}
      >
        <ul className="mt-12 space-y-2 w-full">
          <Link href="/dashboard">
            <li className="hover:bg-blue-700 p-2 rounded">Candidatos</li>
          </Link>
          <Link href="/dashboard/configuracion">
            <li className="hover:bg-blue-700 p-2 rounded">Configuración</li>
          </Link>
          <Link href="/dashboard/credenciales">
            <li className="hover:bg-blue-700 p-2 rounded">
              Generación de Credenciales
            </li>
          </Link>
          <Link href="/dashboard/profile">
            <li className="hover:bg-blue-700 p-2 rounded">Perfil</li>
          </Link>
        </ul>
      </aside>

      {/* Overlay (Closes Sidebar on Click) */}
      {isOpen && (
        <div
          className="fixed inset-0 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
