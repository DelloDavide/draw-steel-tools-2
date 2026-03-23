export function MaliceSpentIndicator({ maliceSpent }: { maliceSpent: number }) {
  if (maliceSpent === 0) return <></>;
  return (
    <div className="pt-2">
      <div className="bg-mirage-199 flex h-9 items-center rounded-full px-4 py-2 font-bold">
        {`${maliceSpent} Malice`}
      </div>
    </div>
  );
}
