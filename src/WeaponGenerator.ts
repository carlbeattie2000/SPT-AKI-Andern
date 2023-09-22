import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";

import * as fs from "fs";

export class WeaponPreset {
    id: string;
    name: string;
    root: string;
    items: Item[];
}

export class GeneratedWeapon {
    weaponWithMods: Item[];
    weaponTemplate: ITemplateItem;
    ammoTpl: string;
}

export abstract class WeaponGenerator {
    protected readonly magazineSlotId = "mod_magazine";
    protected readonly chamberSlotId = "patron_in_weapon";
    protected readonly equipmentSlot = "FirstPrimaryWeapon";

    protected weaponPresets: Record<string, WeaponPreset> = {};

    constructor(
        protected logger: ILogger,
        protected hashUtil: HashUtil,
        protected randomUtil: RandomUtil,
        protected databaseServer: DatabaseServer,
        protected itemHelper: ItemHelper,
        protected modResPath: string
    ) {
        this.loadPresets(modResPath);
    }

    protected itemsDb(): Record<string, ITemplateItem> {
        return this.databaseServer.getTables().templates?.items;
    }

    protected loadPresets(presetsDir: string): void {
        fs.readdir(presetsDir, (err, files) => {
            if (err) {
                console.error("Error reading directory:", err);
                return;
            }
            files.forEach((f) => {
                if (f === "ammo.json") return;
                const jsonData = fs.readFileSync(`${presetsDir}/${f}`, "utf-8");
                const preset = new WeaponPreset();
                Object.assign(preset, JSON.parse(jsonData));

                this.weaponPresets[preset.id] = preset;
            });
        });
    }

    protected getRandomWeapon(): Item[] {
        const keys = Object.keys(this.weaponPresets);
        const randomKey = this.randomUtil.getArrayValue(keys);
        const preset = this.weaponPresets[randomKey];
        return JSON.parse(JSON.stringify(preset.items)) as Item[];
    }

    protected getTemplateIdFromWeaponItems(weaponWithMods: Item[]): string {
        return weaponWithMods[0]._tpl;
    }

    protected getCaliberByTemplateId(tpl: string): string {
        return this.itemsDb()[tpl]._props.ammoCaliber;
    }

    protected abstract getAmmoByCaliber(caliber: string): string;

    protected getWeaponMagazine(weaponWithMods: Item[]): Item {
        return weaponWithMods.find((item) => item.slotId === "mod_magazine");
    }

    protected addCartridgeToChamber(
        weaponWithMods: Item[],
        ammoId: string
    ): undefined {
        const slotName = "patron_in_weapon";

        const existingItemWithSlot = weaponWithMods.find(
            (item) => item.slotId === this.chamberSlotId
        );

        if (!existingItemWithSlot) {
            weaponWithMods.push({
                _id: this.hashUtil.generate(),
                _tpl: ammoId,
                parentId: weaponWithMods[0]._id,
                slotId: slotName,
                upd: { StackObjectsCount: 1 },
            });
        } else {
            existingItemWithSlot.upd = {
                StackObjectsCount: 1,
            };
            existingItemWithSlot._tpl = ammoId;
        }
    }

    protected fillMagazine(weaponWithMods: Item[], ammoTpl: string): undefined {
        for (const magazine of weaponWithMods.filter(
            (x) => x.slotId === this.magazineSlotId
        )) {
            const magazineTemplate = this.getTemplateById(magazine._tpl);
            const magazineWithCartridges = [magazine];

            this.itemHelper.fillMagazineWithCartridge(
                weaponWithMods,
                magazineTemplate,
                ammoTpl,
                1
            );
            weaponWithMods.splice(
                weaponWithMods.indexOf(magazine),
                1,
                ...magazineWithCartridges
            );
        }
    }

    protected getTemplateById(tpl: string): ITemplateItem {
        return this.itemsDb()[tpl];
    }

    protected updateWeaponInfo(
        weaponWithMods: Item[],
        weaponParentId: string
    ): undefined {
        weaponWithMods[0].slotId = this.equipmentSlot;
        weaponWithMods[0].parentId = weaponParentId;
        this.replaceId(weaponWithMods, 0);
    }

    protected replaceId(weaponWithMods: Item[], i: number): undefined {
        const oldId = weaponWithMods[i]._id;
        const newId = this.hashUtil.generate();
        weaponWithMods[i]._id = newId;
        for (const item of weaponWithMods) {
            if (item.parentId && item.parentId === oldId) {
                item.parentId = newId;
            }
        }

        i++;
        if (i < weaponWithMods.length) {
            this.replaceId(weaponWithMods, i);
        }
    }

    public generateWeapon(weaponParentId: string): GeneratedWeapon {
        const weaponWithMods = this.getRandomWeapon();
        this.updateWeaponInfo(weaponWithMods, weaponParentId);
        const weaponTpl = this.getTemplateIdFromWeaponItems(weaponWithMods);
        const weaponTemplate = this.getTemplateById(weaponTpl);
        const caliber = this.getCaliberByTemplateId(weaponTpl);
        const ammoTpl = this.getAmmoByCaliber(caliber);
        this.addCartridgeToChamber(weaponWithMods, ammoTpl);
        this.fillMagazine(weaponWithMods, ammoTpl);

        return {
            weaponWithMods: weaponWithMods,
            weaponTemplate: weaponTemplate,
            ammoTpl: ammoTpl,
        };
    }
}
