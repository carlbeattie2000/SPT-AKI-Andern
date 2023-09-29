import { inject, injectable } from "tsyringe";

import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { Inventory as PmcInventory } from "@spt-aki/models/eft/common/tables/IBotBase";
import { BotGeneratorHelper } from "@spt-aki/helpers/BotGeneratorHelper";
import { BotLootGenerator } from "@spt-aki/generators/BotLootGenerator";
import { GearGenerator } from "./GearGenerator";
import { TierTwoWeapon } from "./TierTwoWeapon";
import { NightHeadwear } from "./NightHeadwear";

@injectable()
export class TierTwoGear extends GearGenerator {
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("BotGeneratorHelper")
        protected botGeneratorHelper: BotGeneratorHelper,
        @inject("BotLootGenerator")
        protected botLootGenerator: BotLootGenerator,
        @inject("AndernTierTwoWeapon")
        protected weaponGenerator: TierTwoWeapon,
        @inject("AndernNightHeadwear")
        protected nightHeadwear: NightHeadwear,
        @inject("ModResPath") protected modResPath: string
    ) {
        super(
            logger,
            hashUtil,
            randomUtil,
            databaseServer,
            botGeneratorHelper,
            botLootGenerator,
            weaponGenerator,
            `${modResPath}/two`
        );
        this.logger.info("[Andern] Tier Two Bot Gear Generator enabled");
    }

    protected generateNightHeadwear(botInventory: PmcInventory): undefined {
        this.nightHeadwear.tierTwoHeadwearWithNvg(botInventory);
    }
}
