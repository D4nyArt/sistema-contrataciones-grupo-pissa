import SideNav from "../components/sidenav";
import SideNavPhone from "../components/sidenav-phone";

export default function Layout({ children }: { children: React.ReactNode }) {
  const role = "candidato"; 

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      <div className="w-full flex-none md:w-64 pl-2 bg-gray-50 md:block hidden">
        <SideNav roleView ={role}/>
      </div>
      <div className="flex-grow md:overflow-y-auto p-6 md:p-12 bg-gray-50 overflow-x-auto pb-24 md:pb-0">
        {children}
      </div>
      <div className="h-20 w-full fixed bottom-0 bg-gray-50 md:hidden block p-2">
        <SideNavPhone roleView={role}/>
      </div>
    </div>
  );
}