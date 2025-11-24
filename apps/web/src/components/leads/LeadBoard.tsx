import LeadColumn from "./LeadColumn";

const stages = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST"];

export default function LeadBoard({ leads }: { leads: any[] }) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-5 gap-2 md:gap-3 min-w-[800px]">
        {stages.map((s) => (
          <LeadColumn
            key={s}
            stage={s}
            leads={leads.filter((l) => l.stage === s)}
          />
        ))}
      </div>
    </div>
  );
}
