import ShowCurrentContract from "./showCurrentContract";
import ContractSendAndPreview from "./contractSendAndPreview";
import ReviewContract from "./reviewContract";
import { urbanist } from "./fonts";

export default function ContractsPage({ uid }: { uid: string }) {
  return (
    <div className="mb-12">
      <h2 className={`${urbanist.className} text-2xl text-[#212529] font-semibold`}>Contratos</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <ShowCurrentContract uid={uid} />
      </div>
      <div>
        <ContractSendAndPreview uid={uid} />
      </div>
      <div>
        <ReviewContract uid={uid} />
      </div>
    </div>
  );
}
