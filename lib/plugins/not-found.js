'use strict';

module.exports = {
    name: 'not-found-handler',
    register: async (server) => {
        server.ext('onPreResponse', (request, h) => {
            const response = request.response;
            
            if (response.isBoom && response.output.statusCode === 404) {
                return h.response({
                    statusCode: 404,
                    error: 'Not Found',
                    message: 'The requested resource was not found',
                    path: request.path
                }).code(404).takeover();
            }

            return h.continue;
        });
    }
};
