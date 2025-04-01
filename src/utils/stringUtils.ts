export function isEmpty(strValue: string | null | undefined): boolean {
    return (!strValue || strValue.trim() === "" || (strValue.trim()).length === 0);
}

export function isNotEmpty(val: any) {
    return typeof val === 'string' && !!val;
}

export function isNotBlank(val: any) {
    return typeof val === 'string' && ((val?.trim()?.length || 0) > 0);
}

export function isBlank(val: any) {
    return typeof val !== 'string' || ((val?.trim()?.length || 0) === 0);
}
