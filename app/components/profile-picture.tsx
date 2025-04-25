export default function ProfilePicture({ nombre, width, height, textSize }) {
  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    const first = parts[0] ? parts[0][0] : "";
    return `${first}`.toUpperCase();
  };

  return (
    <div
      className={`${width} ${height} ${textSize} bg-gray-400 rounded-full flex items-center justify-center text-white font-bold`}
    >
      {getInitials(nombre)}
    </div>
  );
}
