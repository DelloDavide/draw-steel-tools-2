import { useCallback, useEffect, useState, type Context } from "react";
import { parseMetadata } from "../../helpers/parseMetadata";
import OBR, { type Metadata } from "@owlbear-rodeo/sdk";

export function RoomMetadataProvider<T>({
  children,
  metadataKey,
  parser,
  defaultValue,
  DataContext,
  UpdateContext,
}: {
  readonly children: React.ReactNode;
  readonly metadataKey: string;
  readonly parser: (value: unknown) => T;
  readonly defaultValue: T;
  readonly DataContext: Context<T>;
  readonly UpdateContext: Context<(value: T) => void>;
}) {
  const [obrReady, setObrReady] = useState(false);
  useEffect(() => {
    if (OBR.isAvailable) {
      OBR.onReady(() => setObrReady(true));
    }
  }, []);

  const [value, setValue] = useState<T>(defaultValue);
  useEffect(() => {
    if (!obrReady) return;
    const handleRoomMetadata = (metadata: Metadata) => {
      const parsed = parseMetadata(metadata, metadataKey, parser);
      if (parsed === undefined) setValue(defaultValue);
      else setValue(parsed);
    };
    void OBR.room.getMetadata().then(handleRoomMetadata);
    return OBR.room.onMetadataChange(handleRoomMetadata);
  }, [metadataKey, parser, obrReady]);

  // Exposed function that also updates room
  const updateValue = useCallback(
    (newValue: T) => {
      setValue(newValue);
      void OBR.room.setMetadata({
        [metadataKey]: newValue,
      });
    },
    [metadataKey],
  );

  return (
    <DataContext value={value}>
      <UpdateContext value={updateValue}>{children}</UpdateContext>
    </DataContext>
  );
}
