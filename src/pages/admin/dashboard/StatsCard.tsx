import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import LottieAnimation from '@/components/ui/animations/LottieAnimation';

// Centralized labels
const LABELS = {
  FROM_LAST_MONTH: 'le mois dernier',
  TITLES: {
    revenue: 'Aperçu des revenus',
    orders: 'Aperçu des commandes',
  } as Record<string, string>,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: LucideIcon;
  lottieAnimation?: object;
  svgIcon?: string;
  gradient: string;
  iconColor: string;
  vsLastMonthLabel?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  lottieAnimation,
  svgIcon,
  gradient,
  iconColor,
  vsLastMonthLabel,
}) => {
  // Get translated title or use original
  const displayTitle = LABELS.TITLES[title] || title;
  const lastMonthText = vsLastMonthLabel || LABELS.FROM_LAST_MONTH;
  
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Animated gradient background */}
      <div 
        className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${gradient}`}
        style={{
          animation: 'gradient-shift 8s ease infinite',
        }}
      />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 md:p-6 relative z-10">
        <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">
          {displayTitle}
        </CardTitle>
        
        {/* Animated icon container - no background */}
        <div className="relative group-hover:scale-110 transition-transform duration-300">
          {/* Render Lottie animation if provided */}
          {lottieAnimation && (
            <div className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10">
              <LottieAnimation 
                animationData={lottieAnimation} 
                loop={true} 
                autoplay={true}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}
          
          {/* Render SVG icon if provided */}
          {!lottieAnimation && svgIcon && (
            <img 
              src={svgIcon} 
              alt={title}
              className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10"
            />
          )}
          
          {/* Render Lucide icon if no Lottie or SVG */}
          {!lottieAnimation && !svgIcon && Icon && (
            <Icon className={`h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 ${iconColor}`} />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 p-3 sm:p-4 md:p-6 pt-0">
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          {value}
        </div>
        
        {change !== undefined && (
          <div className="flex flex-wrap items-center mt-1.5 sm:mt-2 text-[10px] sm:text-xs">
            {change > 0 ? (
              <>
                <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="font-medium">{Math.abs(change)}%</span>
                </div>
                <span className="ml-1 sm:ml-2 text-muted-foreground hidden sm:inline">{lastMonthText}</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                  <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="font-medium">{Math.abs(change)}%</span>
                </div>
                <span className="ml-1 sm:ml-2 text-muted-foreground hidden sm:inline">{lastMonthText}</span>
              </>
            )}
          </div>
        )}
      </CardContent>
      
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </Card>
  );
};

export default StatsCard;
