class DonationService {
    async searchDonors(bloodGroup, location) {
        try {
            const params = new URLSearchParams({ bloodGroup, location });
            return await utils.fetchWithAuth(`/donors/search?${params}`);
        } catch (error) {
            throw error;
        }
    }

    async getDonationHistory() {
        try {
            return await utils.fetchWithAuth('/donations/history');
        } catch (error) {
            throw error;
        }
    }

    async addDonation(donationDate) {
        try {
            return await utils.fetchWithAuth('/donations', {
                method: 'POST',
                body: JSON.stringify({ donationDate })
            });
        } catch (error) {
            throw error;
        }
    }

    async getProfile() {
        try {
            return await utils.fetchWithAuth('/donors/profile');
        } catch (error) {
            throw error;
        }
    }

    async updateProfile(profileData) {
        try {
            return await utils.fetchWithAuth('/donors/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });
        } catch (error) {
            throw error;
        }
    }
}

const donationService = new DonationService();