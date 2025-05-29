import NavLinks from "./nav-links";

interface SideNavPhoneProps {
  roleView: string;
}

export default function SideNavPhone({ roleView }: SideNavPhoneProps) {
  return (
    <div className="flex h-full flex-col w-full">
      <div className="flex-grow w-full">
        <div className="flex w-full flex-row space-x-2 px-2 py-2 rounded-full bg-[#0d324f] overflow-x-auto">
          <NavLinks roleView={roleView} />
        </div>
      </div>
    </div>
  );
}
