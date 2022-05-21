import { v4 as uuidv4 } from 'uuid';

import { Decision } from "./Decision";
import { SelectionItem } from "./SelectionItem";

export class Settings {
    version: number = 1;
    appInitialized: boolean = false;
    language: string = 'en';
    hasAppLog: boolean = true;
    theme: number = 2;
    uiFontSize: number = 24;
    selectedDecision = 0;
    decisions: Decision[] = [
        new Decision(
            uuidv4(),
            'Which country to travel？',
            [
                new SelectionItem({ title: 'America' }),
                new SelectionItem({ title: 'Japan' }),
                new SelectionItem({ title: 'Australia' }),
                new SelectionItem({ title: 'France' }),
                new SelectionItem({ title: 'Canada' }),
            ]
        )
    ];
}
