"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { X, Settings, Palette, Bell, Globe } from "lucide-react"
import type { Settings as SettingsType } from "@/types"

// Define default settings
const defaultSettings: SettingsType = {
  units: "metric",
  refreshRate: 30,
  displayMode: "detailed",
}

interface SettingsPanelProps {
  settings?: SettingsType
  onSettingsChange: (newSettings: Partial<SettingsType>) => void
  onClose?: () => void
}

export default function SettingsPanel({
  settings = defaultSettings,
  onSettingsChange,
  onClose = () => {},
}: SettingsPanelProps) {
  // Use provided settings or defaults
  const currentSettings = settings || defaultSettings

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              Settings
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Temperature Units */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Temperature Units</Label>
            </div>
            <RadioGroup
              value={currentSettings.units}
              onValueChange={(value: "metric" | "imperial") => onSettingsChange({ units: value })}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="metric" id="metric" />
                <Label htmlFor="metric" className="text-slate-700 dark:text-slate-300">
                  Celsius (°C)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imperial" id="imperial" />
                <Label htmlFor="imperial" className="text-slate-700 dark:text-slate-300">
                  Fahrenheit (°F)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Auto Refresh */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto Refresh</Label>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">{currentSettings.refreshRate} min</span>
            </div>
            <Slider
              value={[currentSettings.refreshRate]}
              min={5}
              max={60}
              step={5}
              onValueChange={(value) => onSettingsChange({ refreshRate: value[0] })}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              How often to automatically refresh weather data (5-60 minutes)
            </p>
          </div>

          {/* Display Mode */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Options</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="detailed-view" className="text-sm text-slate-600 dark:text-slate-400">
                  Detailed view
                </Label>
                <Switch
                  id="detailed-view"
                  checked={currentSettings.displayMode === "detailed"}
                  onCheckedChange={(checked) => onSettingsChange({ displayMode: checked ? "detailed" : "compact" })}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white/50 dark:bg-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80"
            >
              Cancel
            </Button>
            <Button onClick={onClose} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
