import { get30DayTrend } from '@/lib/trendStats'
import { TrendChart } from './TrendChart'

export async function TrendChartAsync({ businessId }: { businessId: string }) {
  const trend = await get30DayTrend(businessId)
  if (trend.length === 0) return null
  return <TrendChart data={trend} />
}
