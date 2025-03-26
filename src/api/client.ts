import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export type ApiResponse<T> = AxiosResponse<{
    data: T[] | string;
    meta: {
        proxima_url?: string;
    };
}>;

export const apiClient = axios.create({
    baseURL: process.env.API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'access-token': process.env.API_TOKEN,
        'secret-access-token': process.env.SECRET_API_TOKEN
    }
});

export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchAllPages<T>(
    endpoint: string,
    maxRetries: number = 5,
    delayBetweenRetries: number = 2000
): Promise<T[]> {
    // Function for retry attempts
    async function fetchWithRetry(url: string, remainingRetries: number): Promise<ApiResponse<T>> {
        try {
            const response = await apiClient.get<any>(url, { timeout: 30000 });

            // Check if response is valid
            if (!response || !response.data) {
                throw new Error('Invalid response');
            }
            // Check if data.data is a string (probably error)
            if (typeof response.data.data === 'string') {
                console.warn(`Warning: Invalid response from endpoint ${url}. Retrying.`);
                if (response.data.data == 'Não há dados!') {
                    console.warn(`Warning: No data available from endpoint ${url}.`);
                    return {
                        ...response,
                        data: {
                            data: [],
                            meta: {}
                        }
                    } as ApiResponse<T>;
                }
                if (remainingRetries > 0) {
                    await delay(delayBetweenRetries);
                    return fetchWithRetry(url, remainingRetries - 1);
                } else {
                    console.error(`Error: Maximum retry attempts exceeded for ${url}`);
                    return {
                        ...response,
                        data: {
                            data: [],
                            meta: {}
                        }
                    } as ApiResponse<T>;
                }
            }

            return response as ApiResponse<T>;
        } catch (error: any) {
            console.error(`Error accessing ${url}: ${error instanceof Error ? error.message : String(error)}`);
            console.log(error.response.data)

            if (remainingRetries > 0) {
                console.log(`Retrying in ${delayBetweenRetries / 1000} seconds. ${remainingRetries} attempts remaining.`);
                await delay(delayBetweenRetries);
                return fetchWithRetry(url, remainingRetries - 1);
            }

            console.error(`All retry attempts for ${url} failed.`);
            return {
                status: 500,
                statusText: 'Error',
                headers: {},
                config: {} as any,
                data: {
                    data: [],
                    meta: {}
                }
            } as ApiResponse<T>;
        }
    }

    // Initialize results array
    const allData: T[] = [];

    try {
        // First request
        let response = await fetchWithRetry(endpoint, maxRetries);

        // Add data from first page
        if (Array.isArray(response.data.data)) {
            allData.push(...(response.data.data as T[]));
        }

        // Load additional pages while there is a proxima_url
        while (response.data.meta && response.data.meta.proxima_url) {
            console.log(response.data.meta)
            try {
                // Small pause to not overload the API
                await delay(500);

                // Fetch next page
                response = await fetchWithRetry(response.data.meta.proxima_url, maxRetries);

                // Add data if it's an array
                if (Array.isArray(response.data.data)) {
                    allData.push(...(response.data.data as T[]));
                }
            } catch (pageError) {
                console.error('Error processing additional page:', pageError instanceof Error ? pageError.message : String(pageError));
                // Continue with already collected data instead of failing completely
                break;
            }
        }

        // @ts-ignore
        console.log(`Loaded ${allData.length} records from endpoint ${endpoint}`);
        return allData;
    } catch (error) {
        console.error('Critical error loading data:', error instanceof Error ? error.message : String(error));
        // Return data collected so far
        return allData;
    }
}