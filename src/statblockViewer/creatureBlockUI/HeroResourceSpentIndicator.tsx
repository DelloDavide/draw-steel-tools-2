export function HeroResourceSpentIndicator({
  resourceName,
  value,
}: {
  resourceName: string;
  value: number;
}) {
  if (value === 0) return <></>;
  return (
    <div className="pt-2">
      <div className="bg-mirage-199 flex h-9 items-center rounded-full px-4 py-2 font-bold">
        {`${value} ${resourceName}`}
      </div>
    </div>
  );
}
