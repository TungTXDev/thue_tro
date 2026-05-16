// Rental History API Service

const rentalHistoryApi = {
    // Get rental history for landlord
    async getRentalHistory(landlordId, status = null) {
        let url = `/rental-history?landlordId=${landlordId}`;
        if (status) {
            url += `&status=${status}`;
        }
        return await fetchAPI(url, { method: 'GET' });
    },

    // Get rental history by ID
    async getRentalHistoryById(id) {
        return await fetchAPI(`/rental-history/${id}`, { method: 'GET' });
    }
};
