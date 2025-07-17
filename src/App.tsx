import { useState } from 'react'
import { Lunar, Solar } from 'lunar-typescript'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, ArrowRight } from "@phosphor-icons/react"

function App() {
  const [year, setYear] = useState<string>("")
  const [lunarMonth, setLunarMonth] = useState<string>("")
  const [lunarDay, setLunarDay] = useState<string>("")
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(false)
  const [result, setResult] = useState<Solar | null>(null)
  const [error, setError] = useState<string>("")

  // Generate year options (1900-2100, which is the range supported by the library)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 201 }, (_, i) => 1900 + i)

  // Generate month options (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const handleConvert = () => {
    setError("")
    setResult(null)

    // Validate inputs
    if (!year || !lunarMonth || !lunarDay) {
      setError("Please fill in all fields")
      return
    }

    const yearNum = parseInt(year)
    const monthNum = parseInt(lunarMonth)
    const dayNum = parseInt(lunarDay)

    // Validate ranges
    if (yearNum < 1900 || yearNum > 2100) {
      setError("Year must be between 1900 and 2100")
      return
    }

    if (monthNum < 1 || monthNum > 12) {
      setError("Month must be between 1 and 12")
      return
    }

    if (dayNum < 1 || dayNum > 30) {
      setError("Day must be between 1 and 30")
      return
    }

    try {
      // For leap months, use negative month number as per Chinese calendar conventions
      const actualMonth = isLeapMonth ? -monthNum : monthNum
      
      // Create lunar date and convert to solar
      const lunar = Lunar.fromYmd(yearNum, actualMonth, dayNum)
      const solar = lunar.getSolar()
      setResult(solar)
    } catch (err) {
      setError("Invalid lunar date. Please check your input values.")
    }
  }

  const formatChineseNumbers = (num: number): string => {
    const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
                         '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                         '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十']
    return chineseNums[num] || num.toString()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-semibold text-foreground mb-2">
            农历转公历
          </h1>
          <h2 className="text-2xl font-display font-medium text-muted-foreground mb-4">
            Chinese Lunar Calendar Converter
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Convert Chinese lunar calendar dates to Gregorian calendar dates with precision and cultural accuracy.
          </p>
        </div>

        {/* Main Converter Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-primary" />
              Date Conversion
            </CardTitle>
            <CardDescription>
              Enter a Chinese lunar calendar date to get the corresponding Gregorian date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Month Selection */}
              <div className="space-y-2">
                <Label htmlFor="month">Lunar Month (农历月)</Label>
                <Select value={lunarMonth} onValueChange={setLunarMonth}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Month..." />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {formatChineseNumbers(m)}月 ({m})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day Input */}
              <div className="space-y-2">
                <Label htmlFor="day">Lunar Day (农历日)</Label>
                <Input
                  id="day"
                  type="number"
                  min="1"
                  max="30"
                  value={lunarDay}
                  onChange={(e) => setLunarDay(e.target.value)}
                  placeholder="Day (1-30)"
                />
              </div>
            </div>

            {/* Year Selection */}
            <div className="space-y-2">
              <Label htmlFor="year">Gregorian Year (公历年份)</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year..." />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y} {y === currentYear && "(Current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Leap Month Option */}
            <div className="flex items-center space-x-2">
              <input
                id="leap-month"
                type="checkbox"
                checked={isLeapMonth}
                onChange={(e) => setIsLeapMonth(e.target.checked)}
                className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
              />
              <Label htmlFor="leap-month" className="text-sm">
                Leap Month (闰月)
              </Label>
            </div>

            {/* Convert Button */}
            <Button 
              onClick={handleConvert} 
              className="w-full"
              size="lg"
            >
              <ArrowRight className="mr-2" />
              Convert to Gregorian Date
            </Button>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Display */}
        {result && (
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-accent-foreground">Conversion Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lunar Date Display */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Chinese Lunar Date</h3>
                  <div className="text-2xl font-display font-medium text-primary">
                    {year}年 {isLeapMonth && "闰"}{formatChineseNumbers(parseInt(lunarMonth))}月 {formatChineseNumbers(parseInt(lunarDay))}日
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {year}-{isLeapMonth ? "闰" : ""}{lunarMonth.padStart(2, '0')}-{lunarDay.padStart(2, '0')}
                  </div>
                </div>

                {/* Gregorian Date Display */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Gregorian Date</h3>
                  <div className="text-2xl font-display font-medium text-accent-foreground">
                    {result.toFullString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(result.getYear(), result.getMonth() - 1, result.getDay()).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-2">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Lunar Year:</span>
                    <div className="font-medium">{result.getLunar().getYearInChinese()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Zodiac:</span>
                    <div className="font-medium">{result.getLunar().getYearShengXiao()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Day of Week:</span>
                    <div className="font-medium">{result.getWeekInChinese()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6 border-muted">
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Select the Gregorian year that contains your lunar date</p>
            <p>2. Choose the lunar month (农历月) from the dropdown</p>
            <p>3. Enter the lunar day (农历日) - typically 1-30</p>
            <p>4. Check "Leap Month" if this is a leap month (闰月)</p>
            <p>5. Click "Convert" to see the equivalent Gregorian date</p>
            <p className="pt-2 text-xs">
              <strong>Note:</strong> This converter supports dates from 1900 to 2100 and follows traditional Chinese lunar calendar calculations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App