export function Label({
  name,
  value,
  showValue = false,
}: {
  name: string;
  value?: string;
  showValue?: boolean;
}) {
  if (value === undefined) showValue = false;

  return (
    <div className="text-foreground pointer-events-none grid pb-0.5 text-xs font-normal">
      <div
        data-show-value={showValue}
        className="col-start-1 row-start-1 block overflow-hidden text-nowrap text-ellipsis transition-all duration-150 data-[show-value=true]:opacity-0"
      >
        {name}
      </div>
      <div
        data-show-value={showValue}
        className="col-start-1 row-start-1 block text-center opacity-0 transition-all duration-150 data-[show-value=true]:opacity-100"
      >
        {value}
      </div>
    </div>
  );
}
