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
  const currentYear = new Date().getFullYear()
  const [language, setLanguage] = useState<'EN' | 'CN'>('EN')
  const [year, setYear] = useState<string>(currentYear.toString())
  const [lunarMonth, setLunarMonth] = useState<string>("")
  const [lunarDay, setLunarDay] = useState<string>("")
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(false)
  const [result, setResult] = useState<Solar | null>(null)
  const [error, setError] = useState<string>("")

  // Generate year options (current year + next 20 years)
  const years = Array.from({ length: 21 }, (_, i) => currentYear + i)

  // Generate month options (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const handleConvert = () => {
    setError("")
    setResult(null)

    // Validate inputs
    if (!year || !lunarMonth || !lunarDay) {
      setError(language === 'EN' ? "Please fill in all fields" : "请填写所有字段")
      return
    }

    const yearNum = parseInt(year)
    const monthNum = parseInt(lunarMonth)
    const dayNum = parseInt(lunarDay)

    // Validate ranges
    if (yearNum < currentYear || yearNum > currentYear + 20) {
      setError(language === 'EN' ? 
        `Year must be between ${currentYear} and ${currentYear + 20}` :
        `年份必须在${currentYear}年到${currentYear + 20}年之间`)
      return
    }

    if (monthNum < 1 || monthNum > 12) {
      setError(language === 'EN' ? "Month must be between 1 and 12" : "月份必须在1到12之间")
      return
    }

    if (dayNum < 1 || dayNum > 30) {
      setError(language === 'EN' ? "Day must be between 1 and 30" : "日期必须在1到30之间")
      return
    }

    try {
      // For leap months, use negative month number as per Chinese calendar conventions
      const actualMonth = isLeapMonth ? -monthNum : monthNum
      
      // Create lunar date and convert to solar
      const lunar = Lunar.fromYmd(yearNum, actualMonth, dayNum)
      const solar = lunar.getSolar()
      setResult(solar)
    } catch {
      setError(language === 'EN' ? 
        "Invalid lunar date. Please check your input values." :
        "无效的农历日期。请检查您的输入值。")
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
        {/* Language Navigation */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-2">
            <span className={`text-sm font-medium ${language === 'EN' ? 'text-primary' : 'text-muted-foreground'}`}>EN</span>
            <button
              type="button"
              aria-label="Toggle language"
              className={`relative w-14 h-7 bg-input rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50`}
              onClick={() => setLanguage(language === 'EN' ? 'CN' : 'EN')}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-primary transition-transform duration-200 ${language === 'EN' ? '' : 'translate-x-7'}`}
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
              />
            </button>
            <span className={`text-sm font-medium ${language === 'CN' ? 'text-primary' : 'text-muted-foreground'}`}>CN</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-semibold text-foreground mb-2">
            {language === 'EN' ? 'Chinese Lunar Calendar Converter' : '农历转公历'}
          </h1>
          {language === 'EN' ? (
            <>
              <h2 className="text-2xl font-display font-medium text-muted-foreground mb-4">
                Lunar to Gregorian Date Conversion
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Convert Chinese lunar calendar dates to Gregorian calendar dates with precision and cultural accuracy.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-display font-medium text-muted-foreground mb-4">
                中国农历日期转换器
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                精确地将中国农历日期转换为公历日期，保持文化准确性。
              </p>
            </>
          )}
        </div>

        {/* Main Converter Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-primary" />
              {language === 'EN' ? 'Date Conversion' : '日期转换'}
            </CardTitle>
            <CardDescription>
              {language === 'EN' ? 
                'Enter a Chinese lunar calendar date to get the corresponding Gregorian date.' :
                '输入中国农历日期以获取相应的公历日期。'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Month Selection */}
              <div className="space-y-2">
                <Label htmlFor="month">
                  {language === 'EN' ? 'Lunar Month' : '农历月'}
                </Label>
                <Select value={lunarMonth} onValueChange={setLunarMonth}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder={language === 'EN' ? 'Month...' : '选择月份...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {language === 'EN' ? 
                          `Month ${m} (${formatChineseNumbers(m)}月)` :
                          `${formatChineseNumbers(m)}月 (${m})`
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day Input */}
              <div className="space-y-2">
                <Label htmlFor="day">
                  {language === 'EN' ? 'Lunar Day' : '农历日'}
                </Label>
                <Input
                  id="day"
                  type="number"
                  min="1"
                  max="30"
                  value={lunarDay}
                  onChange={(e) => setLunarDay(e.target.value)}
                  placeholder={language === 'EN' ? 'Day (1-30)' : '日期 (1-30)'}
                />
              </div>
            </div>

            {/* Year Selection */}
            <div className="space-y-2">
              <Label htmlFor="year">
                {language === 'EN' ? 'Gregorian Year' : '公历年份'}
              </Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder={language === 'EN' ? 'Select year...' : '选择年份...'} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y} {y === currentYear && (language === 'EN' ? '(Current)' : '(当前)')}
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
                {language === 'EN' ? 'Leap Month' : '闰月'}
              </Label>
            </div>

            {/* Convert Button */}
            <Button 
              onClick={handleConvert} 
              className="w-full"
              size="lg"
            >
              <ArrowRight className="mr-2" />
              {language === 'EN' ? 'Convert to Gregorian Date' : '转换为公历日期'}
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
              <CardTitle className="text-accent-foreground">
                {language === 'EN' ? 'Conversion Result' : '转换结果'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lunar Date Display */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    {language === 'EN' ? 'Chinese Lunar Date' : '中国农历日期'}
                  </h3>
                  <div className="text-2xl font-display font-medium text-primary">
                    {year}年 {isLeapMonth && "闰"}{formatChineseNumbers(parseInt(lunarMonth))}月 {formatChineseNumbers(parseInt(lunarDay))}日
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {year}-{isLeapMonth ? "闰" : ""}{lunarMonth.padStart(2, '0')}-{lunarDay.padStart(2, '0')}
                  </div>
                </div>

                {/* Gregorian Date Display */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    {language === 'EN' ? 'Gregorian Date' : '公历日期'}
                  </h3>
                  <div className="text-2xl font-display font-medium text-accent-foreground">
                    {result.getYear()}-{result.getMonth().toString().padStart(2, '0')}-{result.getDay().toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(result.getYear(), result.getMonth() - 1, result.getDay()).toLocaleDateString(
                      language === 'EN' ? 'en-US' : 'zh-CN', {
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
                <h4 className="font-medium text-foreground mb-2">
                  {language === 'EN' ? 'Additional Information' : '附加信息'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {language === 'EN' ? 'Lunar Year:' : '农历年份：'}
                    </span>
                    <div className="font-medium">{result.getLunar().getYearInChinese()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {language === 'EN' ? 'Zodiac:' : '生肖：'}
                    </span>
                    <div className="font-medium">{result.getLunar().getYearShengXiao()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {language === 'EN' ? 'Day of Week:' : '星期：'}
                    </span>
                    <div className="font-medium">
                      {language === 'EN' ? 
                        new Date(result.getYear(), result.getMonth() - 1, result.getDay()).toLocaleDateString('en-US', { weekday: 'long' }) :
                        result.getWeekInChinese()
                      }
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6 border-muted">
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'EN' ? 'How to Use' : '使用方法'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {language === 'EN' ? (
              <>
                <p>1. Choose the lunar month from the dropdown</p>
                <p>2. Enter the lunar day - typically 1-30</p>
                <p>3. Select the Gregorian year that contains your lunar date</p>
                <p>4. Check "Leap Month" if this is a leap month</p>
                <p>5. Click "Convert" to see the equivalent Gregorian date</p>
                <p className="pt-2 text-xs">
                  <strong>Note:</strong> This converter supports dates from {currentYear} to {currentYear + 20} and follows traditional Chinese lunar calendar calculations.
                </p>
              </>
            ) : (
              <>
                <p>1. 从下拉菜单中选择农历月份</p>
                <p>2. 输入农历日期 - 通常为1-30</p>
                <p>3. 选择包含您农历日期的公历年份</p>
                <p>4. 如果是闰月请勾选"闰月"</p>
                <p>5. 点击"转换"查看相应的公历日期</p>
                <p className="pt-2 text-xs">
                  <strong>注意：</strong> 此转换器支持{currentYear}年到{currentYear + 20}年的日期，遵循传统中国农历计算方法。
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App