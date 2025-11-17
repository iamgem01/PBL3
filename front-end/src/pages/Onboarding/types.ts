// types.ts
export interface OnboardingData {
    role?: string;
    work?: string;
    needs?: string[];
    referral?: string;
    template?: string;
}

export interface StepProps {
    onNext: (data: Partial<OnboardingData>) => void;
    data?: OnboardingData;
}