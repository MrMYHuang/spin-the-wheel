import { SelectionItem } from "./SelectionItem";

export class Decision {
    uuid: string = '';
    title: string = '';
    fontSize = 24;

    selections: SelectionItem[] = [];

    constructor(uuid: string, title: string, selections: SelectionItem[] = []) {
        this.uuid = uuid;
        this.title = title;
        this.selections = selections;
    }
}
