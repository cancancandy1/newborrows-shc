// components/borrow/StepIndicator.tsx - แสดงขั้นตอนการยืม
interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
}

const steps = [
  { number: 1, label: 'เลือกอุปกรณ์' },
  { number: 2, label: 'ข้อมูลผู้ยืม' },
  { number: 3, label: 'ยืนยันการยืม' },
]

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step.number < currentStep
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.number === currentStep
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {step.number < currentStep ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`mt-2 text-xs font-medium whitespace-nowrap ${
                step.number === currentStep ? 'text-blue-600' : step.number < currentStep ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-20 mx-2 mb-5 transition-all ${
                step.number < currentStep ? 'bg-green-400' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
