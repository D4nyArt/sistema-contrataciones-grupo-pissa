import ContractInfoView from "./contractinfoview";

export default function AdminContractsPage({ uid }: { uid: string }) {
  return (
    <div className="mb-12">
      <div>
        <ContractInfoView id={uid} />
      </div>
    </div>
  );
}
