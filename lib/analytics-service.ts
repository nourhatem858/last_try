/**
 * Analytics Service
 * Track user behavior and generate insights
 */

export interface UserActivity {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  metadata?: any;
}

export interface AnalyticsInsight {
  type: 'trend' | 'recommendation' | 'alert' | 'achievement';
  title: string;
  description: string;
  data: any;
  priority: 'low' | 'medium' | 'high';
}

export class AnalyticsService {
  /**
   * Track user activity
   */
  static trackActivity(activity: UserActivity): void {
    // In production, send to analytics service
    if (typeof window !== 'undefined') {
      const activities = this.getStoredActivities();
      activities.push(activity);
      
      // Keep only last 100 activities
      if (activities.length > 100) {
        activities.shift();
      }
      
      localStorage.setItem('user_activities', JSON.stringify(activities));
    }
  }

  /**
   * Get stored activities
   */
  private static getStoredActivities(): UserActivity[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('user_activities');
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Generate insights from user activity
   */
  static generateInsights(activities: UserActivity[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    if (activities.length === 0) return insights;

    // Analyze activity patterns
    const actionCounts = this.countActions(activities);
    const resourceCounts = this.countResources(activities);
    const recentActivity = activities.slice(-10);

    // Most used feature
    const topAction = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (topAction) {
      insights.push({
        type: 'trend',
        title: 'Most Used Feature',
        description: `You've been using ${topAction[0]} frequently (${topAction[1]} times)`,
        data: { action: topAction[0], count: topAction[1] },
        priority: 'medium',
      });
    }

    // Productivity streak
    const streak = this.calculateStreak(activities);
    if (streak >= 3) {
      insights.push({
        type: 'achievement',
        title: `${streak}-Day Streak! 🔥`,
        description: `You've been active for ${streak} consecutive days`,
        data: { streak },
        priority: 'high',
      });
    }

    // Recommendations based on usage
    if (actionCounts['create-note'] > 10 && !actionCounts['create-workspace']) {
      insights.push({
        type: 'recommendation',
        title: 'Organize Your Notes',
        description: 'Consider creating workspaces to organize your growing collection of notes',
        data: { noteCount: actionCounts['create-note'] },
        priority: 'medium',
      });
    }

    // Inactive resources alert
    const daysSinceLastDocument = this.daysSinceAction(activities, 'view-document');
    if (daysSinceLastDocument > 7) {
      insights.push({
        type: 'alert',
        title: 'Documents Need Attention',
        description: `It's been ${daysSinceLastDocument} days since you reviewed your documents`,
        data: { days: daysSinceLastDocument },
        priority: 'low',
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Count actions
   */
  private static countActions(activities: UserActivity[]): Record<string, number> {
    return activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Count resources
   */
  private static countResources(activities: UserActivity[]): Record<string, number> {
    return activities.reduce((acc, activity) => {
      acc[activity.resource] = (acc[activity.resource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculate activity streak
   */
  private static calculateStreak(activities: UserActivity[]): number {
    if (activities.length === 0) return 0;

    const dates = activities
      .map(a => new Date(a.timestamp).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    const today = new Date().toDateString();
    
    if (dates[0] !== today) return 0;

    for (let i = 1; i < dates.length; i++) {
      const current = new Date(dates[i]);
      const previous = new Date(dates[i - 1]);
      const diffDays = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Days since last action
   */
  private static daysSinceAction(activities: UserActivity[], action: string): number {
    const lastActivity = activities
      .filter(a => a.action === action)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (!lastActivity) return Infinity;

    const now = new Date();
    const last = new Date(lastActivity.timestamp);
    return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get usage statistics
   */
  static getStatistics(activities: UserActivity[]): {
    totalActions: number;
    uniqueDays: number;
    mostActiveDay: string;
    topActions: Array<{ action: string; count: number }>;
    topResources: Array<{ resource: string; count: number }>;
  } {
    const actionCounts = this.countActions(activities);
    const resourceCounts = this.countResources(activities);
    
    const dates = activities.map(a => new Date(a.timestamp).toDateString());
    const uniqueDays = new Set(dates).size;
    
    const dayCounts = dates.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostActiveDay = Object.entries(dayCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalActions: activities.length,
      uniqueDays,
      mostActiveDay,
      topActions: Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topResources: Object.entries(resourceCounts)
        .map(([resource, count]) => ({ resource, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }
}
