import NavLinks from "./nav-links";

interface SideNavPhoneProps {
  roleView: string;
}

export default function SideNavPhone({ roleView }: SideNavPhoneProps) {
  return (
    <div className="flex h-full flex-col w-full">
      <div className="flex grow flex-row space-x-2">
        <div className="h-auto w-full grow rounded-full bg-[#0d324f] md:block flex flex-row justify-center items-center">
          <NavLinks roleView={roleView}/>
        </div>
      </div>
    </div>
  );
}
