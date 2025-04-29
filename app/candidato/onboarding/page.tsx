import OnboardingCard from "@/app/components/OnboardingCard";


export default function Bienvenida()
{
  return (
    <div>
      <OnboardingCard fileName="INE.pdf" />
      <OnboardingCard fileName="CV.pdf" />
      <OnboardingCard fileName="ACTANACIMIENTO.pdf" />
    </div>
  );
}
