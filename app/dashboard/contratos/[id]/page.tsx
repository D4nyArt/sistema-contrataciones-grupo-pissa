import ContractInfo from "@/app/components/contractinfo";
export default async function ContractInformation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <ContractInfo id={id} />
    </div>
  );
}
