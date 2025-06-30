import React, { useState, useEffect, useCallback } from 'react';
import type { Sprint3FeatureFlags } from '../types/sprint3';

const DEFAULT_FLAGS: Sprint3FeatureFlags = {
  email_integration: false,
  calendar_integration: false,
  ai_suggestions: false,
  local_ai_routing: false,
  cost_tracking: false,
  learning_mode: false,
};

const getEnvFlags = (): Partial<Sprint3FeatureFlags> => {
  if (typeof window === 'undefined') return {};
  
  const envFlags: Partial<Sprint3FeatureFlags> = {};
  
  if (import.meta.env.VITE_FEATURE_EMAIL_INTEGRATION === 'true') {
    envFlags.email_integration = true;
  }
  if (import.meta.env.VITE_FEATURE_CALENDAR_INTEGRATION === 'true') {
    envFlags.calendar_integration = true;
  }
  if (import.meta.env.VITE_FEATURE_AI_SUGGESTIONS === 'true') {
    envFlags.ai_suggestions = true;
  }
  if (import.meta.env.VITE_FEATURE_LOCAL_AI_ROUTING === 'true') {
    envFlags.local_ai_routing = true;
  }
  if (import.meta.env.VITE_FEATURE_COST_TRACKING === 'true') {
    envFlags.cost_tracking = true;
  }
  if (import.meta.env.VITE_FEATURE_LEARNING_MODE === 'true') {
    envFlags.learning_mode = true;
  }
  
  return envFlags;
};

const STORAGE_KEY = 'logos_feature_flags_sprint3';

const getStoredFlags = (): Partial<Sprint3FeatureFlags> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to parse stored feature flags:', error);
    return {};
  }
};

const saveStoredFlags = (flags: Partial<Sprint3FeatureFlags>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch (error) {
    console.warn('Failed to save feature flags:', error);
  }
};

export const useFeatureFlags = () => {
  const [userOverrides, setUserOverrides] = useState<Partial<Sprint3FeatureFlags>>(getStoredFlags);
  
  const flags: Sprint3FeatureFlags = {
    ...DEFAULT_FLAGS,
    ...getEnvFlags(),
    ...userOverrides,
  };
  
  const updateFlag = useCallback((key: keyof Sprint3FeatureFlags, value: boolean) => {
    const newOverrides = { ...userOverrides, [key]: value };
    setUserOverrides(newOverrides);
    saveStoredFlags(newOverrides);
  }, [userOverrides]);
  
  const toggleFlag = useCallback((key: keyof Sprint3FeatureFlags) => {
    updateFlag(key, !flags[key]);
  }, [flags, updateFlag]);
  
  const resetFlags = useCallback(() => {
    setUserOverrides({});
    saveStoredFlags({});
  }, []);
  
  const hasAnyAIFeatures = flags.ai_suggestions || flags.local_ai_routing;
  const hasAnyProviderIntegrations = flags.email_integration || flags.calendar_integration;
  const isFullyEnabled = Object.values(flags).every(Boolean);
  
  const envFlags = getEnvFlags();
  const getEnvControlledFlags = (): (keyof Sprint3FeatureFlags)[] => {
    return Object.keys(envFlags) as (keyof Sprint3FeatureFlags)[];
  };
  
  return {
    flags,
    userOverrides,
    
    isEmailIntegrationEnabled: flags.email_integration,
    isCalendarIntegrationEnabled: flags.calendar_integration,
    isAISuggestionsEnabled: flags.ai_suggestions,
    isLocalAIRoutingEnabled: flags.local_ai_routing,
    isCostTrackingEnabled: flags.cost_tracking,
    isLearningModeEnabled: flags.learning_mode,
    
    hasAnyAIFeatures,
    hasAnyProviderIntegrations,
    isFullyEnabled,
    
    updateFlag,
    toggleFlag,
    resetFlags,
    
    envControlledFlags: getEnvControlledFlags(),
    isEnvControlled: (key: keyof Sprint3FeatureFlags) => key in envFlags,
  };
};

export const withFeatureFlag = <P extends object>(
  Component: React.ComponentType<P>,
  flagKey: keyof Sprint3FeatureFlags,
  fallback: React.ComponentType<P> | null = null
) => {
  return (props: P) => {
    const { flags } = useFeatureFlags();
    
    if (flags[flagKey]) {
      return <Component {...props} />;
    }
    
    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent {...props} />;
    }
    
    return null;
  };
};

export const useFeatureGate = (flagKey: keyof Sprint3FeatureFlags) => {
  const { flags } = useFeatureFlags();
  
  return {
    isEnabled: flags[flagKey],
    ifEnabled: (callback: () => void) => {
      if (flags[flagKey]) {
        callback();
      }
    },
    ifDisabled: (callback: () => void) => {
      if (!flags[flagKey]) {
        callback();
      }
    },
  };
}; 