import axiosClient from './axiosClient';

const recommendationService = {
    getRecommendations: async () => {
        try {
            const response = await axiosClient.get('recommendation');
            return response;
        } catch (error) {
            console.error('Get recommendations error:', error);
            throw error;
        }
    }
};

export default recommendationService;