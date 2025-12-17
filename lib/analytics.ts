import { BetaAnalyticsDataClient } from '@google-analytics/data';

const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
const propertyId = process.env.GA4_PROPERTY_ID;

let analyticsDataClient: BetaAnalyticsDataClient | null = null;

try {
    if (credentialsJson) {
        const credentials = JSON.parse(credentialsJson);
        analyticsDataClient = new BetaAnalyticsDataClient({
            credentials,
        });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Fallback to file path if JSON content is not provided directly
        analyticsDataClient = new BetaAnalyticsDataClient();
    }
} catch (error) {
    console.error('Failed to initialize Google Analytics client:', error);
}

export async function getRealtimeActiveUsers(customPropertyId?: string) {
    const targetPropertyId = customPropertyId || propertyId;

    if (!analyticsDataClient || !targetPropertyId) {
        console.warn('Google Analytics client not initialized or Property ID missing.');
        return null;
    }

    try {
        const [response] = await analyticsDataClient.runRealtimeReport({
            property: `properties/${targetPropertyId}`,
            dimensions: [{ name: 'unifiedScreenName' }],
            metrics: [{ name: 'activeUsers' }],
            limit: 10,
        });

        // Sum up all active users from the response rows
        let totalActiveUsers = 0;
        response.rows?.forEach((row) => {
            const users = parseInt(row.metricValues?.[0]?.value || '0', 10);
            totalActiveUsers += users;
        });

        return {
            activeUsers: totalActiveUsers,
            breakdown: response.rows?.map((row) => ({
                screenName: row.dimensionValues?.[0]?.value || 'Unknown',
                activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
            })),
        };
    } catch (error) {
        console.error('Error fetching realtime analytics:', error);
        return null;
    }
}

export async function getBatchRealtimeActiveUsers(properties: { appId: string; propertyId: string }[]) {
    if (!analyticsDataClient) return [];

    const promises = properties.map(async ({ appId, propertyId }) => {
        if (!propertyId) return { appId, activeUsers: 0, error: 'No Property ID' };

        try {
            const [response] = await analyticsDataClient.runRealtimeReport({
                property: `properties/${propertyId}`,
                metrics: [{ name: 'activeUsers' }],
            });
            const activeUsers = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
            return { appId, activeUsers };
        } catch (error) {
            console.error(`Error fetching for app ${appId}:`, error);
            return { appId, activeUsers: 0, error: 'Failed to fetch' };
        }
    });

    return Promise.all(promises);
}
