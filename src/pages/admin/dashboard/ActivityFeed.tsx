import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import {
  ShoppingCart,
  Package,
  Users,
  Activity,
} from 'lucide-react';
import { Activity as ActivityType } from '@/supabase';

interface ActivityFeedProps {
  activities: ActivityType[];
  formatTimeAgo: (timestamp: string) => string;
  title?: string;
  description?: string;
}

const getActivityIcon = (type: string) => {
  const iconClass = "h-3 w-3 sm:h-4 sm:w-4";
  const containerClass = "p-1.5 sm:p-2 rounded-md sm:rounded-lg";
  
  switch (type) {
    case 'order': 
      return (
        <div className={`${containerClass} bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg`}>
          <ShoppingCart className={`${iconClass} text-white`} />
        </div>
      );
    case 'product': 
      return (
        <div className={`${containerClass} bg-gradient-to-br from-green-500 to-green-600 shadow-lg`}>
          <Package className={`${iconClass} text-white`} />
        </div>
      );
    case 'customer': 
      return (
        <div className={`${containerClass} bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg`}>
          <Users className={`${iconClass} text-white`} />
        </div>
      );
    case 'system': 
      return (
        <div className={`${containerClass} bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg`}>
          <Activity className={`${iconClass} text-white`} />
        </div>
      );
    default: 
      return (
        <div className={`${containerClass} bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg`}>
          <Activity className={`${iconClass} text-white`} />
        </div>
      );
  }
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  formatTimeAgo,
  title = 'Recent Activity',
  description = 'Latest events'
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <CardTitle className="text-sm sm:text-base md:text-lg">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 group"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="mt-0.5 group-hover:scale-110 transition-transform duration-200 shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium leading-none truncate">{activity.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                  {activity.description}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/50" />
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  );
};

export default ActivityFeed;
