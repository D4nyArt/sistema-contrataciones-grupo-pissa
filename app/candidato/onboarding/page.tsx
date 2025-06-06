import { urbanist } from "@/app/components/fonts";
import OnboardingPage from "@/app/components/OnboardingPage";

export default function Onboarding() {
  return (
    <>
      <h1 className={`${urbanist.className} font-bold text-4xl text-[#212529]`}>
        Onboarding
      </h1>
      <OnboardingPage />
    </>
  );
}
