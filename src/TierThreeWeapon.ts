import { inject, injectAll, injectable } from "tsyringe";

import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { BotWeaponGeneratorHelper } from "@spt-aki/helpers/BotWeaponGeneratorHelper";
import { IInventoryMagGen } from "@spt-aki/generators/weapongen/IInventoryMagGen";
import { WeaponGenerator } from "./WeaponGenerator";
import * as ammo from "../res/three/ammo.json";

@injectable()
export class TierThreeWeapon extends WeaponGenerator {
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("BotWeaponGeneratorHelper")
        protected botWeaponGeneratorHelper: BotWeaponGeneratorHelper,
        @injectAll("InventoryMagGen")
        protected inventoryMagGenComponents: IInventoryMagGen[],
        @inject("ModResPath") protected modResPath: string
    ) {
        super(
            logger,
            hashUtil,
            randomUtil,
            databaseServer,
            itemHelper,
            botWeaponGeneratorHelper,
            inventoryMagGenComponents,
            `${modResPath}/three`
        );
        this.logger.info("[Andern] Tier Three Bot Weapon Changes enabled");
    }

    protected getAmmoByCaliber(caliber: string): string {
        return ammo[caliber];
    }
}
