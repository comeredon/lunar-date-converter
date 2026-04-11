import { useState, useEffect, useMemo } from 'react'
import { Lunar, LunarMonth, LunarYear, Solar } from 'lunar-typescript'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, ArrowRight, Sun, Moon, DownloadSimple } from "@phosphor-icons/react"

function App() {
  // Helper to download ICS file
  const downloadICS = async () => {
    if (!result) return;
    const eventName = window.prompt(language === 'EN' ? 'Enter event name:' : '输入事件名称:');
    if (!eventName) return;
    // Gregorian date
    const year = result.getYear();
    const month = result.getMonth().toString().padStart(2, '0');
    const day = result.getDay().toString().padStart(2, '0');
    // All-day event
    const dtStart = `${year}${month}${day}`;
    const dtEnd = `${year}${month}${(parseInt(day)+1).toString().padStart(2, '0')}`;
    const dtStamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(4));
    const randomSuffix = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
    const uid = `${dtStart}-${randomSuffix}@lunar-date-converter`;
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}Z`,
      `SUMMARY:${eventName}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      'DESCRIPTION=Lunar Date Conversion',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventName}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  // Dark mode state
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showIOSInstall, setShowIOSInstall] = useState(false)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  // Listen for PWA install prompt (Android/Chrome)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setDeferredPrompt(null)
    } else {
      setShowIOSInstall(true)
    }
  }
  // Dark mode: set html class based on device preference
  useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateTheme = () => {
      const dark = darkQuery.matches
      document.documentElement.classList.toggle('dark', dark)
      setIsDark(dark)
    }
    updateTheme()
    darkQuery.addEventListener('change', updateTheme)
    return () => darkQuery.removeEventListener('change', updateTheme)
  }, [])
  const currentYear = new Date().getFullYear()
  const [language, setLanguage] = useState<'EN' | 'CN'>('EN')
  const [year, setYear] = useState<string>(currentYear.toString())
  const [lunarMonth, setLunarMonth] = useState<string>("")
  const [lunarDay, setLunarDay] = useState<string>("")
  const [result, setResult] = useState<Solar | null>(null)
  const [error, setError] = useState<string>("")

  // Auto-detect leap month based on selected year and month (derived state)
  const isLeapMonth = useMemo(() => {
    if (!year || !lunarMonth) return false
    const leapMonth = LunarYear.fromYear(parseInt(year)).getLeapMonth()
    return leapMonth > 0 && leapMonth === parseInt(lunarMonth)
  }, [year, lunarMonth])

  // Generate year options (2 years before current year + next 20 years)
  const years = Array.from({ length: 23 }, (_, i) => currentYear - 2 + i)

  // Generate month options (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  // Compute number of days in the selected lunar month
  const daysInMonth = useMemo(() => {
    if (!year || !lunarMonth) return 30
    try {
      const monthNum = isLeapMonth ? -parseInt(lunarMonth) : parseInt(lunarMonth)
      const lm = LunarMonth.fromYm(parseInt(year), monthNum)
      return lm ? lm.getDayCount() : 30
    } catch {
      return 30
    }
  }, [year, lunarMonth, isLeapMonth])

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Handlers that also clamp lunarDay when month/year changes
  const handleYearChange = (newYear: string) => {
    setYear(newYear)
  }
  const handleMonthChange = (newMonth: string) => {
    setLunarMonth(newMonth)
  }

  // Clamp day when daysInMonth shrinks
  const effectiveLunarDay = lunarDay && parseInt(lunarDay) > daysInMonth
    ? daysInMonth.toString()
    : lunarDay

  const formatChineseDayName = (day: number): string => {
    const chineseDays = [
      '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ]
    return chineseDays[day] || day.toString()
  }

  const handleConvert = () => {
    setError("")
    setResult(null)

    // Validate inputs
    if (!year || !lunarMonth || !effectiveLunarDay) {
      setError(language === 'EN' ? "Please fill in all fields" : "请填写所有字段")
      return
    }

    const yearNum = parseInt(year)
    const monthNum = parseInt(lunarMonth)
    const dayNum = parseInt(effectiveLunarDay)

    // Validate ranges
    if (yearNum < currentYear - 2 || yearNum > currentYear + 20) {
      setError(language === 'EN' ? 
        `Year must be between ${currentYear - 2} and ${currentYear + 20}` :
        `年份必须在${currentYear - 2}年到${currentYear + 20}年之间`)
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
      <div className="container mx-auto px-4 py-8 max-w-2xl relative">
        {/* Top Right Controls */}
        <div className="absolute top-8 right-4 flex items-center gap-1.5">
          {/* Install App Button */}
          {!isStandalone && (
            <button
              type="button"
              aria-label="Install app"
              onClick={handleInstall}
              className="p-1.5 rounded-md border border-border bg-card text-foreground hover:bg-accent transition-colors"
            >
              <DownloadSimple size={16} />
            </button>
          )}
          {/* Dark Mode Toggle */}
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => {
              const next = !isDark
              setIsDark(next)
              document.documentElement.classList.toggle('dark', next)
            }}
            className="p-1.5 rounded-md border border-border bg-card text-foreground hover:bg-accent transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* iOS Install Instructions */}
        {showIOSInstall && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowIOSInstall(false)}>
            <div className="bg-card border border-border rounded-t-2xl p-6 w-full max-w-md mb-0" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold text-foreground mb-3 text-center">
                {language === 'EN' ? 'Install this App' : '安装此应用'}
              </h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>{language === 'EN'
                  ? '1. Tap the Share button in Safari (the square with an arrow)'
                  : '1. 点击 Safari 中的分享按钮（带箭头的方框）'}</p>
                <p>{language === 'EN'
                  ? '2. Scroll down and tap "Add to Home Screen"'
                  : '2. 向下滑动并点击"添加到主屏幕"'}</p>
                <p>{language === 'EN'
                  ? '3. Tap "Add" to install'
                  : '3. 点击"添加"完成安装'}</p>
              </div>
              <button
                onClick={() => setShowIOSInstall(false)}
                className="mt-4 w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
              >
                {language === 'EN' ? 'Got it' : '知道了'}
              </button>
            </div>
          </div>
        )}

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
            <div className="flex justify-between gap-2">
              {/* Month Selection */}
              <div className="space-y-2">
                <Label htmlFor="month">
                  {language === 'EN' ? 'Month' : '月'}
                </Label>
                <Select value={lunarMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder={language === 'EN' ? 'Month' : '月份'} />
                  </SelectTrigger>
                  <SelectContent side="bottom" avoidCollisions={false} className="max-h-[180px]">
                    {months.map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {language === 'EN' ? 
                          `${m} (${formatChineseNumbers(m)}月)` :
                          `${formatChineseNumbers(m)}月`
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day Selection */}
              <div className="space-y-2">
                <Label htmlFor="day">
                  {language === 'EN' ? 'Day' : '日'}
                </Label>
                <Select value={effectiveLunarDay} onValueChange={setLunarDay}>
                  <SelectTrigger id="day">
                    <SelectValue placeholder={language === 'EN' ? 'Day' : '日期'} />
                  </SelectTrigger>
                  <SelectContent side="bottom" avoidCollisions={false} className="max-h-[180px]">
                    {days.map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {language === 'EN' ?
                          `${d} (${formatChineseDayName(d)})` :
                          `${formatChineseDayName(d)}`
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Selection */}
              <div className="space-y-2">
                <Label htmlFor="year">
                  {language === 'EN' ? 'Year' : '年'}
                </Label>
                <Select value={year} onValueChange={handleYearChange}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder={language === 'EN' ? 'Year' : '年份'} />
                  </SelectTrigger>
                  <SelectContent side="bottom" avoidCollisions={false} className="max-h-[180px]">
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y} {y === currentYear && (language === 'EN' ? '(Current)' : '(当前)')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Leap Month Option */}
            <div className="flex items-center space-x-2">
              <input
                id="leap-month"
                type="checkbox"
                checked={isLeapMonth}
                disabled
                className="h-4 w-4 text-primary border-border rounded focus:ring-primary disabled:opacity-60"
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
                    {year}年 {isLeapMonth && "闰"}{formatChineseNumbers(parseInt(lunarMonth))}月 {formatChineseNumbers(parseInt(effectiveLunarDay))}日
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {year}-{isLeapMonth ? "闰" : ""}{lunarMonth.padStart(2, '0')}-{effectiveLunarDay.padStart(2, '0')}
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

              {/* Download ICS Button */}
              <div className="flex justify-center pt-2">
                <Button variant="secondary" onClick={downloadICS}>
                  {language === 'EN' ? 'Download Calendar Event (.ics)' : '下载日历事件 (.ics)'}
                </Button>
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
                <p>4. "Leap Month" is automatically checked when the selected year and month correspond to a leap month</p>
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
                <p>4. 当所选年份和月份对应闰月时，"闰月"会自动勾选</p>
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