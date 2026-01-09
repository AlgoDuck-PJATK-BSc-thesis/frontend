// MessageTypes.ts
import type { ItemType } from "$lib/Components/Misc/Pond/duckTypes";
import type { Item } from "./Dtos";

export type ShopEventArgs = {
    entered_shop: { userCurrencyCount: number };
    item_selected: { selected: ItemType };
    purchase_rejected: Record<string, never>;
    purchase_accepted: { userCoins: number; item: Item };
    tab_changed: { tab: ItemType };
};

export type Message<T extends ShopEventType = ShopEventType> = {
    messageRarity: MessageRarity;
    messageContent: string;
    predicate?: (args: ShopEventArgs[T]) => boolean;
};

export const shopkeepMessageRegistry: {
    [K in ShopEventType]: Message<K>[]
} = {
    "entered_shop": [
        {
            predicate: (args) => args.userCurrencyCount < 100,
            messageContent: "Pockets lighter than a feather, huh? Just browsing then?",
            messageRarity: "common"
        },
        {
            predicate: (args) => args.userCurrencyCount >= 1000,
            messageContent: "Well well, a high roller! See anything you fancy?",
            messageRarity: "common"
        },
        {
            messageContent: "Welcome! Take a look around.",
            messageRarity: "common",
        }
    ],
    "item_selected": [
        {
            predicate: (args) => args.selected === "Duck",
            messageRarity: "common",
            messageContent: "Ah, a fine specimen you've got your eye on!"
        },
        {
            predicate: (args) => args.selected === "Duck",
            messageRarity: "common",
            messageContent: "That one's got personality, I can tell."
        },
        {
            predicate: (args) => args.selected === "Duck",
            messageRarity: "common",
            messageContent: "Excellent taste in waterfowl!"
        },
        {
            predicate: (args) => args.selected === "Plant",
            messageRarity: "common",
            messageContent: "A green thumb, eh?"
        },
        {
            predicate: (args) => args.selected === "Plant",
            messageRarity: "common",
            messageContent: "That one practically waters itself. Almost."
        },
        {
            predicate: (args) => args.selected === "Plant",
            messageRarity: "common",
            messageContent: "Lovely choice. Very photosynthetic."
        }
    ],
    "purchase_rejected": [
        {
            messageContent: "Changed your mind? No worries, it'll be here... probably.",
            messageRarity: "common"
        },
        {
            messageContent: "Playing hard to get with your wallet, I see.",
            messageRarity: "common"
        },
        {
            messageContent: "The duck looks disappointed. Just saying.",
            messageRarity: "common"
        }
    ],
    "purchase_accepted": [
        {
            messageContent: "Can't sell it to you twice man",
            messageRarity: "common",
            predicate: (args) => args.item.isOwned 
        },
        {
            messageContent: "Pleasure doing business!",
            messageRarity: "common",
            predicate: (args) => args.userCoins >= args.item.price 
        },
        {
            messageContent: "You know I can't sell anything if you don't have the cash.",
            messageRarity: "common",
            predicate: (args) => args.userCoins < args.item.price
        }
    ],
    "tab_changed": [],
} as const;

export type ShopEventType = 'entered_shop' | 'item_selected' | 'purchase_rejected' | 'purchase_accepted' | 'tab_changed';
export type MessageRarity = "common" | "rare" | "epic";

export const RaritiesToScalers: Record<MessageRarity, number> = {
    "common": 10,
    "rare": 2,
    "epic": 1,
} as const;

type QueuedAction = 
    | { type: 'shopkeep_event'; eventType: ShopEventType; predicateArgs: ShopEventArgs[ShopEventType] }
    | { type: 'shopkeep_message'; messageContents: string }
    | { type: 'delay'; ms: number }
    | { type: 'binary_prompt'; messageContents: string; onAccept: () => void; onReject?: () => void }
    | { type: 'clear_messages' };


export type ConversationExecutor = {
    queueShopkeepMessage: (messageContents: string) => void;
    queueBinaryPrompt: (args: { messageContents: string; onAccept: () => void; onReject?: () => void }) => void;
    clearMessages: () => void;
    delay: (ms: number) => Promise<void>;
};

export class ConversationBuilder {
    private actions: QueuedAction[] = [];
    
    constructor(private executor: ConversationExecutor) {}

    react<T extends ShopEventType>(eventType: T, predicateArgs: ShopEventArgs[T]): ConversationBuilder {
        this.actions.push({ 
            type: 'shopkeep_event', 
            eventType, 
            predicateArgs: predicateArgs as ShopEventArgs[ShopEventType]
        });
        return this;
    }

    say(messageContents: string): ConversationBuilder {
        this.actions.push({ type: 'shopkeep_message', messageContents });
        return this;
    }

    wait(ms: number): ConversationBuilder {
        this.actions.push({ type: 'delay', ms });
        return this;
    }

    clear(): ConversationBuilder {
        this.actions.push({ type: 'clear_messages' });
        return this;
    }

    prompt(args: { 
        messageContents: string; 
        onAccept: () => void; 
        onReject?: () => void 
    }): void {
        this.actions.push({ 
            type: 'binary_prompt', 
            messageContents: args.messageContents,
            onAccept: args.onAccept,
            onReject: args.onReject
        });
        this.execute();
    }

    end(): void {
        this.execute();
    }

    private async execute(): Promise<void> {
        for (const action of this.actions) {
            switch (action.type) {
                case 'shopkeep_event':
                    const message = this.selectMessageFromRegistry(action.eventType, action.predicateArgs);
                    if (message) {
                        this.executor.queueShopkeepMessage(message);
                    }
                    break;
                    
                case 'shopkeep_message':
                    this.executor.queueShopkeepMessage(action.messageContents);
                    break;
                    
                case 'delay':
                    await this.executor.delay(action.ms);
                    break;
                    
                case 'clear_messages':
                    this.executor.clearMessages();
                    break;
                    
                case 'binary_prompt':
                    this.executor.queueBinaryPrompt({
                        messageContents: action.messageContents,
                        onAccept: action.onAccept,
                        onReject: action.onReject
                    });
                    break;
            }
        }
        
        this.actions = [];
    }

    private selectMessageFromRegistry<T extends ShopEventType>(
        eventType: T, 
        predicateArgs: ShopEventArgs[ShopEventType]
    ): string | undefined {
        const messages = shopkeepMessageRegistry[eventType] as Message<T>[];
        const typedArgs = predicateArgs as ShopEventArgs[T];
        
        const predicatedMessages = messages.filter(m => m.predicate && m.predicate(typedArgs));
        const nonPredicatedMessages = messages.filter(m => !m.predicate);

        const pool = predicatedMessages.length > 0 ? predicatedMessages : nonPredicatedMessages;
        
        if (pool.length === 0) return;

        const totalWeight = pool.reduce((acc, m) => acc + RaritiesToScalers[m.messageRarity], 0);
        const selected = Math.random() * totalWeight;
        
        let cumulative = 0;
        for (const message of pool) {
            cumulative += RaritiesToScalers[message.messageRarity];
            if (selected < cumulative) {
                return message.messageContent;
            }
        }
        
        return pool[pool.length - 1].messageContent;
    }
}