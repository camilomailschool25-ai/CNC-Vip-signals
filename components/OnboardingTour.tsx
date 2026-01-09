import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { 
  X, ArrowRight, ArrowLeft, TrendingUp, Info, 
  BarChart3, Clock, Zap, Target, Sparkles, CheckCircle2 
} from 'lucide-react';

interface TourStep {
  id: string;
  titleKey: string;
  descKey: string;
  targetId?: string;
  icon: any;
}

interface OnboardingTourProps {
  onFinish: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onFinish }) => {
  const { t } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    { id: 'welcome', titleKey: 'tour_welcome_title', descKey: 'tour_welcome_desc', icon: Sparkles },
    { id: 'pair', titleKey: 'tour_step1_title', descKey: 'tour_step1_desc', targetId: 'tour-pair', icon: BarChart3 },
    { id: 'timeframe', titleKey: 'tour_step2_title', descKey: 'tour_step2_desc', targetId: 'tour-timeframe', icon: Clock },
    { id: 'analyze', titleKey: 'tour_step3_title', descKey: 'tour_step3_desc', targetId: 'tour-analyze', icon: Zap },
    { id: 'signals', titleKey: 'tour_step4_title', descKey: 'tour_step4_desc', targetId: 'tour-signals', icon: Target },
  ];

  useEffect(() => {
    const updateTarget = () => {
      const targetId = steps[currentStep]?.targetId;
      if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
          
          // Smooth scroll to target if not fully visible
          const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (!isVisible) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      } else {
        setTargetRect(null);
      }
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    return () => window.removeEventListener('resize', updateTarget);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const step = steps[currentStep];
  const StepIcon = step.icon;

  // Smart Tooltip Positioning
  const getTooltipStyle = () => {
    if (!targetRect) return {};

    const padding = 20;
    const cardWidth = 360;
    const cardHeight = 240;

    let top = targetRect.bottom + padding;
    let left = targetRect.left + (targetRect.width / 2) - (cardWidth / 2);

    // Flip to top if no space at bottom
    if (top + cardHeight > window.innerHeight) {
      top = targetRect.top - cardHeight - padding;
    }

    // Constrain to horizontal bounds
    left = Math.max(padding, Math.min(window.innerWidth - cardWidth - padding, left));

    return { top, left };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Dynamic Backdrop with Spotlight */}
      <div className="absolute inset-0 bg-black/70 pointer-events-auto backdrop-blur-[2px] transition-all duration-500" />
      
      {/* High-quality Spotlight highlight */}
      {targetRect && (
        <div 
          className="absolute z-[101] bg-transparent rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] transition-all duration-500 pointer-events-none ring-4 ring-cnc-500 ring-offset-4 ring-offset-transparent animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Modern Tooltip Card */}
      <div 
        ref={cardRef}
        className={`absolute z-[102] w-full max-w-[360px] bg-cnc-800 border border-cnc-700/50 rounded-2xl shadow-2xl p-6 pointer-events-auto transition-all duration-500 transform ${
          !targetRect ? 'scale-110' : 'scale-100'
        }`}
        style={getTooltipStyle()}
      >
        {/* Card Header & Progress Bar */}
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="p-2 bg-cnc-500/10 rounded-lg text-cnc-500">
                  <StepIcon size={20} />
               </div>
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Step {currentStep + 1} of {steps.length}</span>
            </div>
            <button onClick={handleSkip} className="text-gray-500 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i <= currentStep ? 'bg-cnc-500' : 'bg-cnc-700'
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-8">
          <h3 className="text-lg font-bold text-white tracking-tight">{t[step.titleKey]}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {t[step.descKey]}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 0 ? (
               <button 
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 hover:text-white transition-all uppercase tracking-wider"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : (
              <button 
                onClick={handleSkip}
                className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-white transition-all uppercase tracking-wider"
              >
                Skip
              </button>
            )}
          </div>

          <button 
            onClick={handleNext}
            className="group bg-white text-black hover:bg-cnc-500 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-white/5 transition-all active:scale-95"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <span>Complete</span>
                <CheckCircle2 size={16} />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;