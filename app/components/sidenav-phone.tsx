import NavLinks from "./nav-links";

interface SideNavPhoneProps {
  roleView: string;
}

export default function SideNavPhone({ roleView }: SideNavPhoneProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div 
        className="flex items-center justify-center p-2 h-17 w-full rounded-xl bg-[#0d324f]">
        <NavLinks roleView={roleView} />
      </div>
    </div>
  );
}