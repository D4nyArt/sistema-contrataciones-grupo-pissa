import FormularioRec from "./form-olvide";

export default function FondoBlanco({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-white rounded-4xl p-10 items-center">{children}</div>
  );
}
