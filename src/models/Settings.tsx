import { v4 as uuidv4 } from 'uuid';

import { Decision } from "./Decision";

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
            'Which to travel？',
            [
                { title: 'America' },
                { title: 'Japan' },
                { title: 'Australia' },
                { title: 'France' },
                { title: 'Canada' },
            ]
        )
    ];
}
