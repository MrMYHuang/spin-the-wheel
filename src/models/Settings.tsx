import { v4 as uuidv4 } from 'uuid';

import { Decision } from "./Decision";
import { SelectionItem } from "./SelectionItem";

export class Settings {
    version: number = 1;
    hasAppLog: boolean = true;
    theme: number = 2;
    uiFontSize: number = 24;
    selectedDecision = 0;
    decisions: Decision[] = [
        new Decision(
            uuidv4(),
            '出國去哪玩？',
            [
                new SelectionItem({ title: '美國' }),
                new SelectionItem({ title: '日本' }),
                new SelectionItem({ title: '澳洲' }),
                new SelectionItem({ title: '法國' }),
                new SelectionItem({ title: '加拿大' }),
            ]
        )
    ];
}
