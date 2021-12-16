/** @see {isPersonBilder} ts-auto-guard:type-guard */
export interface PersonBilder {
  streckenId?: number;
  streckenName?: string;
  bilder?: {
    id?: number;
    index?: number;
  }[];
}
