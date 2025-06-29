import { useState } from 'react';
import { Cog, LogOut, Sun, Moon, Monitor, Keyboard, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import { soundManager } from '@/lib/sounds';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ProviderConnectionsDialog } from './ProviderConnectionsDialog';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';


interface TimerSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
  inactiveNotificationsEnabled: boolean;
  inactiveTimeoutMinutes: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
  inactiveNotificationsEnabled: true,
  inactiveTimeoutMinutes: 15,
};

export function SettingsDialog() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { hasAnyProviderIntegrations } = useFeatureFlags();
  const [settings, setSettings] = useLocalStorage<TimerSettings>(
    "pomodoroSettings",
    DEFAULT_SETTINGS
  );
  const [volume, setVolume] = useState(soundManager.getVolume());
  const [isMuted, setIsMuted] = useState(soundManager.isSoundMuted());
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setSettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
    if (!isMuted && newVolume > 0) {
      soundManager.testSound();
    }
  };

  const handleMuteToggle = () => {
    soundManager.toggleMute();
    setIsMuted(!isMuted);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-12 w-12"
        aria-label="Settings"
        title="Settings"
      >
        <IconWrapper>
          <Cog className="text-primary" strokeWidth={2.5} />
        </IconWrapper>
      </button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your timer, notifications, appearance, sound, and account preferences.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="timer">
          <TabsList className={`grid w-full ${hasAnyProviderIntegrations ? 'grid-cols-7' : 'grid-cols-6'}`}>
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="notifications">Notify</TabsTrigger>
            <TabsTrigger value="appearance">Theme</TabsTrigger>
            <TabsTrigger value="sound">Sound</TabsTrigger>
            <TabsTrigger value="shortcuts">Keys</TabsTrigger>
            {hasAnyProviderIntegrations && (
              <TabsTrigger value="providers">Connect</TabsTrigger>
            )}
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          <TabsContent value="timer" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workDuration" className="text-sm font-medium">
                    Work Duration
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    How long each work session lasts
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      id="workDuration"
                      name="workDuration"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={handleSettingsChange}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="breakDuration" className="text-sm font-medium">
                    Break Duration
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Short break between work sessions
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      id="breakDuration"
                      name="breakDuration"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.breakDuration}
                      onChange={handleSettingsChange}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="longBreakDuration" className="text-sm font-medium">
                    Long Break Duration
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Extended break after several sessions
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      id="longBreakDuration"
                      name="longBreakDuration"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={handleSettingsChange}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="sessionsUntilLongBreak" className="text-sm font-medium">
                    Sessions Until Long Break
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Number of work sessions before a long break
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      id="sessionsUntilLongBreak"
                      name="sessionsUntilLongBreak"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.sessionsUntilLongBreak}
                      onChange={handleSettingsChange}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">sessions</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Inactive Notifications</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get reminded when you've been away from LogOS
                    </p>
                  </div>
                  <Checkbox
                    checked={settings.inactiveNotificationsEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        inactiveNotificationsEnabled: checked as boolean
                      }))
                    }
                  />
                </div>
                
                {settings.inactiveNotificationsEnabled && (
                  <div>
                    <Label htmlFor="inactiveTimeout" className="text-sm font-medium">
                      Notification Delay
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      How long to wait before showing inactive reminder
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="inactiveTimeout"
                        name="inactiveTimeoutMinutes"
                        type="number"
                        min="1"
                        max="120"
                        value={settings.inactiveTimeoutMinutes}
                        onChange={handleSettingsChange}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSettings(prev => ({ ...prev, inactiveTimeoutMinutes: 5 }))}
                        className="text-xs"
                      >
                        5 min
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSettings(prev => ({ ...prev, inactiveTimeoutMinutes: 15 }))}
                        className="text-xs"
                      >
                        15 min
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSettings(prev => ({ ...prev, inactiveTimeoutMinutes: 30 }))}
                        className="text-xs"
                      >
                        30 min
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSettings(prev => ({ ...prev, inactiveTimeoutMinutes: 60 }))}
                        className="text-xs"
                      >
                        1 hour
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="appearance" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div>
                <Label className="text-sm font-medium">Theme</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose how LogOS looks to you
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="sound" className="space-y-4">
            <div className="flex items-center gap-4 py-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMuteToggle}
                className="text-primary"
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                )}
              </Button>
              <div className="flex-1">
                <Label>Volume</Label>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                  aria-label="Adjust sound volume"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => soundManager.testSound()}
                disabled={isMuted}
                className="text-xs"
              >
                Test
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Sound Effects</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Audio feedback for timer and task completion
                </p>
                <div className="flex items-center justify-between">
                  <Label htmlFor="soundEnabled" className="text-sm">
                    Timer Sound Notifications
                  </Label>
                  <Checkbox
                    id="soundEnabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        soundEnabled: checked as boolean
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="shortcuts" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Keyboard Shortcuts
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Use these shortcuts to navigate and control LogOS quickly
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Quick Task Creation</p>
                      <p className="text-xs text-muted-foreground">Create a new task instantly</p>
                    </div>
                    <kbd className="flex items-center gap-1 px-2 py-1 bg-background border rounded text-xs font-mono">
                      ⌘K
                    </kbd>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Return to Dashboard</p>
                      <p className="text-xs text-muted-foreground">Navigate back to main dashboard</p>
                    </div>
                    <kbd className="flex items-center gap-1 px-2 py-1 bg-background border rounded text-xs font-mono">
                      ⌘H
                    </kbd>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Close Dialog</p>
                      <p className="text-xs text-muted-foreground">Close any open dialog or modal</p>
                    </div>
                    <kbd className="flex items-center gap-1 px-2 py-1 bg-background border rounded text-xs font-mono">
                      ESC
                    </kbd>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Focus Mode Toggle</p>
                      <p className="text-xs text-muted-foreground">Enter or exit focus mode</p>
                    </div>
                    <kbd className="flex items-center gap-1 px-2 py-1 bg-background border rounded text-xs font-mono">
                      ⌘F
                    </kbd>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> On Windows and Linux, use Ctrl instead of ⌘ (Command key)
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          {hasAnyProviderIntegrations && (
            <TabsContent value="providers" className="space-y-4">
              <div className="grid gap-4 py-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Provider Connections
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your email and calendar accounts to enable AI-powered insights
                  </p>
                  
                  <ProviderConnectionsDialog 
                    trigger={
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        Manage Connections
                      </Button>
                    }
                  />
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                      <span>🔒</span>
                      <span className="font-medium text-sm">Privacy First</span>
                    </div>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• All connections use read-only permissions</li>
                      <li>• Email content is processed locally with AI</li>
                      <li>• Only summaries and insights are stored</li>
                      <li>• You can disconnect at any time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
          <TabsContent value="account" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Signed in as</Label>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-start">
                <Button 
                  variant="destructive" 
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
    </>
  );
} 