import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Download, Upload, Smartphone, HardDrive, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OfflineSettings {
  enabled: boolean;
  syncInterval: number;
  cacheSize: number;
  autoSync: boolean;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingUploads: number;
  cacheSize: number;
  isInitializing: boolean;
}

const OfflineCapabilities = () => {
  const [settings, setSettings] = useState<OfflineSettings>({
    enabled: true,
    syncInterval: 300, // 5 minutes
    cacheSize: 50, // MB
    autoSync: true,
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingUploads: 0,
    cacheSize: 0,
    isInitializing: true,
  });
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeOfflineCapabilities();
    setupEventListeners();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeOfflineCapabilities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: business } = await supabase
        .from("businesses")
        .select("id, offline_settings")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (business) {
        setBusinessId(business.id);
        const offlineSettings = business.offline_settings as any;
        if (offlineSettings) {
          setSettings({
            enabled: offlineSettings.enabled ?? true,
            syncInterval: offlineSettings.syncInterval ?? 300,
            cacheSize: offlineSettings.cacheSize ?? 50,
            autoSync: offlineSettings.autoSync ?? true,
          });
        }
      }

      // Get initial sync status
      await updateSyncStatus();
    } catch (error) {
      console.error("Error initializing offline capabilities:", error);
    } finally {
      setSyncStatus(prev => ({ ...prev, isInitializing: false }));
    }
  };

  const setupEventListeners = () => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  const handleOnline = () => {
    setSyncStatus(prev => ({ ...prev, isOnline: true }));
    if (settings.autoSync) {
      syncData();
    }
    toast({
      title: "Connection restored",
      description: "You're back online. Syncing data...",
    });
  };

  const handleOffline = () => {
    setSyncStatus(prev => ({ ...prev, isOnline: false }));
    toast({
      title: "You're offline",
      description: "Your data will be saved locally and synced when you reconnect",
    });
  };

  const updateSyncStatus = async () => {
    try {
      if (!businessId) return;

      // Get pending sync items
      const { data: pendingItems } = await supabase
        .from("offline_sync_log")
        .select("id")
        .eq("business_id", businessId)
        .eq("synced", false);

      // Get cache info from localStorage
      const cacheInfo = getCacheInfo();

      setSyncStatus(prev => ({
        ...prev,
        pendingUploads: pendingItems?.length || 0,
        cacheSize: cacheInfo.size,
        lastSync: cacheInfo.lastSync,
      }));
    } catch (error) {
      console.error("Error updating sync status:", error);
    }
  };

  const getCacheInfo = () => {
    const lastSync = localStorage.getItem('lastSyncTime');
    let totalSize = 0;
    
    // Calculate localStorage size
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('offline_')) {
        totalSize += (localStorage[key].length + key.length) * 2; // rough estimate in bytes
      }
    }

    return {
      size: Math.round(totalSize / 1024 / 1024 * 100) / 100, // MB
      lastSync: lastSync ? new Date(lastSync) : null,
    };
  };

  const syncData = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      // Get pending sync items
      const { data: pendingItems } = await supabase
        .from("offline_sync_log")
        .select("*")
        .eq("business_id", businessId)
        .eq("synced", false);

      if (pendingItems && pendingItems.length > 0) {
        // Process each pending item
        for (const item of pendingItems) {
          try {
            await processSyncItem(item);
            
            // Mark as synced
            await supabase
              .from("offline_sync_log")
              .update({ synced: true })
              .eq("id", item.id);
          } catch (error) {
            console.error(`Error syncing item ${item.id}:`, error);
          }
        }
      }

      // Update last sync time
      localStorage.setItem('lastSyncTime', new Date().toISOString());
      
      // Update status
      await updateSyncStatus();

      toast({
        title: "Sync completed",
        description: `Synced ${pendingItems?.length || 0} items successfully`,
      });
    } catch (error) {
      console.error("Error during sync:", error);
      toast({
        title: "Sync failed",
        description: "Failed to sync some data. Will retry later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processSyncItem = async (item: any) => {
    const { table_name, record_id, action, data } = item;
    
    switch (action) {
      case 'create':
        await supabase.from(table_name).insert(data);
        break;
      case 'update':
        await supabase.from(table_name).update(data).eq('id', record_id);
        break;
      case 'delete':
        await supabase.from(table_name).delete().eq('id', record_id);
        break;
    }
  };

  const saveSettings = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          offline_settings: {
            enabled: settings.enabled,
            syncInterval: settings.syncInterval,
            cacheSize: settings.cacheSize,
            autoSync: settings.autoSync,
          },
        })
        .eq("id", businessId);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Offline capabilities settings updated successfully",
      });

      // Reinitialize if enabled
      if (settings.enabled && 'serviceWorker' in navigator) {
        await initializeServiceWorker();
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save offline settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      // Clear localStorage cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('offline_')) {
          localStorage.removeItem(key);
        }
      });

      // Clear service worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      await updateSyncStatus();
      
      toast({
        title: "Cache cleared",
        description: "All offline data has been cleared",
      });
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {syncStatus.isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={syncStatus.isOnline ? "default" : "destructive"}>
                {syncStatus.isOnline ? "Online" : "Offline"}
              </Badge>
              {syncStatus.lastSync && (
                <span className="text-sm text-muted-foreground">
                  Last sync: {syncStatus.lastSync.toLocaleString()}
                </span>
              )}
            </div>
            <Button
              onClick={syncData}
              disabled={!syncStatus.isOnline || loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offline Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Offline Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="offline-enabled">Enable Offline Mode</Label>
              <p className="text-sm text-muted-foreground">
                Allow the app to work without internet connection
              </p>
            </div>
            <Switch
              id="offline-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enabled: checked })
              }
            />
          </div>

          {settings.enabled && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync">Auto-sync when online</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data when connection is restored
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={settings.autoSync}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoSync: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Cache Usage</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Storage used: {syncStatus.cacheSize}MB</span>
                    <span>Limit: {settings.cacheSize}MB</span>
                  </div>
                  <Progress value={(syncStatus.cacheSize / settings.cacheSize) * 100} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sync Status</Label>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Pending uploads: {syncStatus.pendingUploads}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    <span className="text-sm">Cache: {syncStatus.cacheSize}MB</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveSettings} disabled={loading}>
                  Save Settings
                </Button>
                <Button variant="outline" onClick={clearCache}>
                  Clear Cache
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineCapabilities;