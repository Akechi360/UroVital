import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function PreferencesPage() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Manage your language and notification settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select defaultValue="en">
            <SelectTrigger id="language" className="w-[200px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Email Notifications</Label>
          <div className="flex items-center space-x-4">
            <Button variant="outline">All</Button>
            <Button variant="outline">Only mentions</Button>
            <Button variant="destructive">None</Button>
          </div>
        </div>
        <Button>Save Preferences</Button>
      </CardContent>
    </Card>
  )
}
