import { ActorPF2e } from "@actor";
import { ItemPF2e } from "@item";
import { RuleElementOptions, RuleElementPF2e, RuleElementSource } from "./index.ts";

class ActorTraitsRuleElement extends RuleElementPF2e {
    add: string[] = [];

    remove: string[] = [];

    constructor(data: ActorTraitsSource, item: ItemPF2e<ActorPF2e>, options?: RuleElementOptions) {
        data.add ??= [];
        data.remove ??= [];

        super({ ...data, priority: 99 }, item, options);

        if (!(Array.isArray(data.add) && Array.isArray(data.remove))) {
            this.failValidation("`add` and `remove` properties must be arrays or omitted");
            return;
        }

        if (data.add.length === 0 && data.remove.length === 0) {
            this.failValidation("At least one non-empty `add` or `remove` array is required");
            return;
        }

        for (const array of [data.add, data.remove]) {
            if (!array.every((t): t is string => typeof t === "string")) {
                this.failValidation("Actor traits must consist only of strings");
                return;
            }
        }

        this.add = data.add;
        this.remove = data.remove;
    }

    override beforePrepareData(): void {
        if (!this.test()) return;

        if (this.actor.system.traits) {
            const traits: { value: string[] } = this.actor.system.traits;
            const newTraits = this.resolveInjectedProperties(this.add).filter((t) => !traits.value.includes(t));
            for (const trait of newTraits) {
                traits.value.push(trait);
                this.actor.rollOptions.all[`self:trait:${trait}`] = true;
            }

            const toRemoves = this.resolveInjectedProperties(this.remove);
            for (const trait of toRemoves) {
                traits.value = traits.value.filter((t) => t !== trait);
                delete this.actor.rollOptions.all[`self:trait:${trait}`];
            }
        }
    }
}

interface ActorTraitsSource extends RuleElementSource {
    add?: unknown;
    remove?: unknown;
}

export { ActorTraitsRuleElement };
