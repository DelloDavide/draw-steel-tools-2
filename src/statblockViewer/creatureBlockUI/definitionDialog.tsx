import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Feature } from "./Feature";
import { insertTextStyling } from "./insertTextStyling";
import definitions from "../../rulesReference/definitions.json";
import { titleRegexList } from "./regex";

const ErrorText = ({ text }: { text: string }) => (
  <span>
    <span>{text}</span>
    <span className="text-red-600"> definition missing</span>
  </span>
);

export function DefinitionDialog({
  children,
  text,
  tags,
}: {
  children: React.ReactNode;
  text: string;
  tags: string[];
}) {
  const title = titleRegexList
    .filter((definition) => definition.tags.some((tag) => tags.includes(tag)))
    .find((val) => val.regex.test(text))?.title;
  if (!title) return <ErrorText text={text} />;

  const definition = definitions.find((val) => title === val.title);
  if (!definition) return <ErrorText text={text} />;

  let key = 0;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-md rounded-2xl" showCloseButton>
        <div className="space-y-3 text-sm">
          <DialogTitle className="mb-4">
            {definition.title.substring(0)}
          </DialogTitle>
          {definition.body.map((val) => (
            <p key={key++}>{insertTextStyling(val, true)}</p>
          ))}
          {definition.append &&
            definition.append.map((text) => {
              const subDefinition = definitions.find(
                (val) => val.title === text,
              );
              if (!subDefinition) {
                return (
                  <div
                    key={key++}
                  >{`Could not find definition for ${text}.`}</div>
                );
              }

              return (
                <div key={key++} className="space-y-3">
                  <h1 className="font-bold">{text}</h1>
                  {subDefinition.body.map((val) => (
                    <p key={key++}>{insertTextStyling(val, true)}</p>
                  ))}
                </div>
              );
            })}

          {definition.title === "Grabbed" && (
            <div className="border-t pt-2">
              <Feature
                blockName="None"
                feature={{
                  feature_type: "ability",
                  icon: "",
                  name: "Escape Grab",
                  type: "feature",
                  ability_type: "Maneuver",
                  target: "Self",
                  distance: "Self",
                  effects: [
                    {
                      roll: "Power Roll + Might or Agility",
                      tier1: "No effect.",
                      tier2:
                        "You can escape the grab, but if you do, a creature who has you grabbed can make a melee free strike against you before you are no longer grabbed.",
                      tier3: "You are no longer grabbed.",
                    },
                    {
                      name: "Effect",
                      effect:
                        "You take a bane on this maneuver if your size is smaller than the size of the creature, object, or effect that has you grabbed.",
                    },
                  ],
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
