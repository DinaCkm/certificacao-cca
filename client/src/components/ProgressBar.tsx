interface ProgressStep {
  id: number;
  label: string;
  completed: boolean;
  current: boolean;
}

interface ProgressBarProps {
  steps: ProgressStep[];
  title?: string;
}

export function ProgressBar({ steps, title }: ProgressBarProps) {
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
      {title && (
        <h3 className="text-sm font-bold text-blue-900 mb-4">📍 {title}</h3>
      )}
      
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
                step.completed
                  ? "bg-green-600 text-white"
                  : step.current
                  ? "bg-blue-600 text-white ring-4 ring-blue-300"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {step.completed ? "✓" : step.current ? "●" : step.id}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all ${
                  step.completed ? "bg-green-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between gap-2 mt-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`text-xs font-semibold text-center flex-1 ${
              step.completed
                ? "text-green-700"
                : step.current
                ? "text-blue-700"
                : "text-gray-600"
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}
