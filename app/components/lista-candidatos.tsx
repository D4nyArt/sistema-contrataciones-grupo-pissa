import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfilePicture from "./profile-picture";
import { Mail, Phone, LayoutGrid, Table2 } from "lucide-react";
import { urbanist } from "./fonts";

interface User {
  id: string;
  nombre?: string;
  apellidos?: string;
  rol?: string;
  email?: string;
  telefono?: string;
  status?: string;
}

const UserCard = ({ user }: { user: User }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/dashboard/${user.id}`)}
      className="cursor-pointer p-4 bg-white rounded-xl shadow-md transition-transform transform hover:scale-105 md:h-30 h-45 flex flex-col"
    >
      <div className="flex flex-col md:flex-row md:justify-between">
        <div className="flex-none pr-2">
          <ProfilePicture
            nombre={`${user.nombre || ""}`}
            width={"w-8"}
            height={"h-8"}
            textSize={"text-xl"}
          />
        </div>
        <div
          className={`${urbanist.className} text-lg font-semibold text-black pb-4 flex-auto`}
        >
          {user.nombre || "N/A"} {user.apellidos || ""}
        </div>
        <div className="text-sm text-[#2975a0] flex-initial">
          {user.rol || "N/A"}
        </div>
      </div>
      <div className="text-sm text-[#495057] flex flex-row">
        <Mail className="pr-2" /> {user.email || "N/A"}
      </div>
      <div className="text-sm text-[#495057] flex flex-row">
        <Phone className="pr-2" />
        {user.telefono || "N/A"}
      </div>
    </div>
  );
};

export default function ListUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activo, setActivo] = useState<"grid" | "tabla">("grid");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error al cargar usuarios", err);
      }
    };
    fetchUsers();
  }, []);

  const filtrarUsuarios = users.filter((user) => {
    const buscar = searchTerm.toLowerCase();
    const esCandidato = user.rol?.toLowerCase() === "candidato";
    const nombreCompleto = `${user.nombre || ""} ${
      user.apellidos || ""
    }`.toLocaleLowerCase();

    return (
      esCandidato &&
      (user.id?.toLowerCase().includes(buscar) ||
        user.nombre?.toLowerCase().includes(buscar) ||
        user.apellidos?.toLowerCase().includes(buscar) ||
        user.email?.toLowerCase().includes(buscar) ||
        user.telefono?.includes(buscar) ||
        nombreCompleto.includes(buscar))
    );
  });

  const sortedUsers = sortOption
    ? [...filtrarUsuarios].sort((a, b) => {
        let prop: keyof User = "nombre";
        if (sortOption.includes("apellido")) prop = "apellidos";

        const textA = (a[prop] || "").toLowerCase();
        const textB = (b[prop] || "").toLowerCase();

        return sortOption.includes("ZA")
          ? textB.localeCompare(textA)
          : textA.localeCompare(textB);
      })
    : filtrarUsuarios;

  return (
    <main className="flex-1 p-4">
      <div className="mb-4 flex gap-6 text-black">
        {/*<label>Ordenar por:</label>*/}
        <input
          type="text"
          placeholder="Buscar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-400 rounded-lg w-full"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="cursor-pointer border p-1 pl-4 rounded-lg bg-[#2d4583] text-white"
        >
          <option value="">Ordenar por</option>
          <option value="nombreAZ">Nombre A → Z</option>
          <option value="nombreZA">Nombre Z → A</option>
          <option value="apellidoAZ">Apellido A → Z</option>
          <option value="apellidoZA">Apellido Z → A</option>
        </select>
        <div className="md:flex shadow-md bg-white rounded-l-lg rounded-r-lg hidden text-[#495057]">
          <button
            onClick={() => setActivo("grid")}
            className={`cursor-pointer rounded-lg  p-1 pl-2 pr-2 transition-colors border ${
              activo === "grid"
                ? "border-[#2d4583] text-[#2d4583]"
                : "border-transparent hover:text-[#2d4583]"
            }`}
          >
            <LayoutGrid />
          </button>
          <button
            onClick={() => setActivo("tabla")}
            className={`cursor-pointer rounded-lg p-1 pl-2 pr-2 transition-colors border ${
              activo === "tabla"
                ? "border-[#2d4583] text-[#2d4583]"
                : "border-transparent hover:text-[#2d4583]"
            }`}
          >
            <Table2 />
          </button>
        </div>
      </div>

      {activo === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-center">
          {sortedUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {activo === "tabla" && (
        <div>
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="border-b border-gray-300 px-2 py-1 text-start">
                  ID
                </th>
                <th className="border-b border-gray-300 px-2 py-1 text-start">
                  Nombre
                </th>
                <th className="border-b border-gray-300 px-2 py-1 text-start">
                  Apellidos
                </th>
                <th className="border-b border-gray-300 px-2 py-1 text-start">
                  Rol
                </th>
                <th className="border-b border-gray-300 px-2 py-1 text-start">
                  Correo
                </th>
                <th className="border-b border-gray-300 px-2 py-1 text-start">
                  Teléfono
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.length === 0 ? (
                <tr>
                  <td
                    className="border-b border-gray-300 px-2 py-1 text-center"
                    colSpan={6}
                  >
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="border-b border-gray-300 px-2 py-1">
                      {user.id}
                    </td>
                    <td className="border-b border-gray-300 px-2 py-1">
                      {user.nombre || "N/A"}
                    </td>
                    <td className="border-b border-gray-300 px-2 py-1">
                      {user.apellidos || "N/A"}
                    </td>
                    <td className="border-b border-gray-300 px-2 py-1">
                      {user.rol || "N/A"}
                    </td>
                    <td className="border-b border-gray-300 px-2 py-1">
                      {user.email || "N/A"}
                    </td>
                    <td className="border-b border-gray-300 px-2 py-1">
                      {user.telefono || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
