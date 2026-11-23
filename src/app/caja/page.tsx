import { getDailyDueInstallments } from "@/actions/cash-actions";
import { DailyCollectionsView } from "@/components/cash/DailyCollectionsView";

export const dynamic = "force-dynamic";

interface CajaPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function CajaPage({ searchParams }: CajaPageProps) {
  const { date } = await searchParams;
  const data = await getDailyDueInstallments(date);

  return (
    <DailyCollectionsView
      date={data.date}
      items={data.items}
      totalToCollectToday={data.totalToCollectToday}
      totalOverdue={data.totalOverdue}
      grandTotalPending={data.grandTotalPending}
      totalCollectedToday={data.totalCollectedToday}
      countDueToday={data.countDueToday}
      countOverdue={data.countOverdue}
    />
  );
}
