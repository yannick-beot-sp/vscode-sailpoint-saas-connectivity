export function compareCaseInsensitive(a: any, b: any, property: string) {
    return a[property].localeCompare(b[property], undefined, { sensitivity: 'base' })
}

/**
 * Function used to compare 2 objects by the property 'name'. Useful for sorting most ISC objects without sorters
 */
export const compareByName = (a: any, b: any) => compareCaseInsensitive(a, b, "name");

/**
 * Function used to compare 2 objects by the property 'label'. Useful for sorting QuickPickItem or TreeItem
 */
export const compareByLabel = (a: any, b: any) => compareCaseInsensitive(a, b, "label");