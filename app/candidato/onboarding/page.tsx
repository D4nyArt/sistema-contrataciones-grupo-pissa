import OnboardingCard from "@/app/components/OnboardingCard";


export default function Bienvenida()
{
  return (
    <div>      
      <div className="parent md:grid md:grid-cols-3 md:grid-rows-5 gap-4">
          <div><OnboardingCard fileName="INE.pdf"/></div>
          <div><OnboardingCard fileName="CV.pdf" /></div>
          <div><OnboardingCard fileName="ACTANACIMIENTO.pdf" /></div>
          <div className="bg-gray-400 rounded-xl"></div>
          <div className="bg-gray-400 rounded-xl"></div>
          <div className="bg-gray-400 rounded-xl"></div>
          <div className="bg-gray-400 rounded-xl"></div>
          <div className="bg-gray-400 rounded-xl"></div>
          <div className="bg-gray-400 rounded-xl"></div>
          <div className="bg-gray-400 rounded-xl"></div>
          <div className="bg-gray-400 rounded-xl"></div>
          <div className="bg-gray-400 rounded-xl"></div>
          <div className="bg-gray-400 rounded-xl"></div>
          <div className="bg-gray-400 rounded-xl"></div>
          <div className="bg-gray-400 rounded-xl"></div>
      </div>
    </div>
  );
}
