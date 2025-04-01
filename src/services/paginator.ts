import { PaginatedData, PaginatedQueryParams } from "../models/API";

export async function paginator<T, TQuery extends PaginatedQueryParams, TResult>(
    thisArg: T,
    callbackFn: (this: T, args: TQuery) => Promise<PaginatedData<TResult>>,
    args: TQuery,
    increment = 100
): Promise<TResult[]> {

    let params: TQuery = { ...args, limit: increment, offset: 0, metadata: true }
    let results: TResult[] = [];
    let response: PaginatedData<TResult>

    do {
        console.debug(`Paginating call, offset = ${params.offset}`);
        response = await callbackFn.call(thisArg, params);
        results.push.apply(results, response.data);
        params.offset! += increment;
    } while (params.offset! < response._metadata!.total)

    return results
}