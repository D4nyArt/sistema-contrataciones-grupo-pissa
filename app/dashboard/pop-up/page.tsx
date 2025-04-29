import PopUp from "@/app/components/pop-up";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <PopUp show={true} onClose={() => {}} />
    </main>
  );
}
