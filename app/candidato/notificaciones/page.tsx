import ShowNotifications from "@/app/components/shownotifications";

export default function CandidateNotifications() {
  return (
    <div className="flex flex-col space-y-2 p-4">
      <h1 className="text-2xl font-bold">Notificaciones</h1>
      <ShowNotifications />
    </div>
  );
}