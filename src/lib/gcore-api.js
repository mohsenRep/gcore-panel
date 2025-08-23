class GCoreAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.gcore.com'; // Placeholder - will be updated with actual endpoint
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Authorization': `APIKey ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('GCore API Error:', error);
            throw error;
        }
    }

    // Test API key validity
    async testConnection() {
        try {
            // Placeholder endpoint - will be updated with actual endpoint
            const data = await this.makeRequest('/iam/users');
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get account information
    async getAccountInfo() {
        try {
            // Placeholder - will be updated with actual endpoint
            return await this.makeRequest('/iam/users');
        } catch (error) {
            throw new Error(`Failed to fetch account info: ${error.message}`);
        }
    }

    // Get traffic usage for current month
    async getMonthlyTraffic() {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            // Placeholder - will be updated with actual endpoint and date parameters
            const params = new URLSearchParams({
                service: 'CDN',
                from: startOfMonth.toISOString(),
                to: now.toISOString(),
                granularity: '1d',
                metrics: 'total_bytes'
            });

            const data = await this.makeRequest(`/cdn/statistics/series?${params}`);
            const totalBytes = data.metrics.total_bytes.reduce((sum, [, value]) => sum + value, 0);


            // تبدیل به GB (دهدهی)
            const totalGB = totalBytes / 1e9;


            return { limit: 1000, used: totalGB };
        } catch (error) {
            throw new Error(`Failed to fetch monthly traffic: ${error.message}`);
        }
    }

    // Get detailed traffic usage
    async getDetailedTraffic(startDate, endDate) {
        try {
            const params = new URLSearchParams({
                service: 'CDN',
                from: startDate,
                to: endDate,
                granularity: '1d',
                metrics: 'total_bytes'
            });

            // Placeholder - will be updated with actual endpoint
            return await this.makeRequest(`/cdn/statistics/series?${params}`);
        } catch (error) {
            throw new Error(`Failed to fetch detailed traffic: ${error.message}`);
        }
    }
}

export { GCoreAPI };