import ShowCurrentContract from "./showCurrentContract";
import ContractSendAndPreview from "./contractSendAndPreview";
import ReviewContract from "./reviewContract";

export default function ContractsPage({ uid }: { uid: string }) {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6">
        <ShowCurrentContract uid={uid} />
      </div>
      <div>
        <ContractSendAndPreview uid={uid} />
      </div>
      <div>
        <ReviewContract />
      </div>
    </div>
  );
}
