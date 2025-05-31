Understood! You're looking for an alternative way to structure and write the JavaScript code for your parking management system. Let's refactor it to use async/await for better readability and introduce a more modular approach with a dedicated ParkingService class to encapsulate the API interactions.

This approach makes the code cleaner, especially for handling asynchronous operations and managing the API calls.

JS/main.js (Alternative Version)
JavaScript

// JS/main.js

// 1. Define API Endpoints
const ENDPOINTS = {
    create: 'http://cnms-parking-api.net.uztec.com.br/api/v1/entry',
    stayTime: 'http://cnms-parking-api.net.uztec.com.br/api/v1/time/',
    exit: 'http://cnms-parking-api.net.uztec.com.br/api/v1/exit/',
    verify: 'http://cnms-parking-api.net.uztec.com.br/api/v1/check/',
    update: 'http://cnms-parking-api.net.uztec.com.br/api/v1/update/',
    cancel: 'http://cnms-parking-api.net.uztec.com.br/api/v1/cancel/'
};

// 2. Create a ParkingService Class for API Interactions
class ParkingService {
    constructor(endpoints) {
        this.endpoints = endpoints;
    }

    /**
     * Generic method to send requests to the API.
     * @param {string} url - The full URL for the request.
     * @param {string} method - HTTP method (GET, POST, PATCH, PUT, DELETE).
     * @param {object} [payload=null] - Data to send in the request body.
     * @returns {Promise<object>} - A promise that resolves with the JSON response.
     */
    async #sendRequest(url, method = 'GET', payload = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            if (payload) {
                options.body = JSON.stringify(payload);
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                throw new Error(errorData.message || 'Requisição falhou.');
            }

            return await response.json();
        } catch (error) {
            console.error('Network or API error:', error);
            throw error; // Re-throw to be caught by specific form handlers
        }
    }

    async registerEntry(model, plate) {
        return this.#sendRequest(this.endpoints.create, 'POST', { model, plate });
    }

    async getStayTime(plate) {
        return this.#sendRequest(this.endpoints.stayTime + plate, 'GET');
    }

    async registerExit(plate) {
        return this.#sendRequest(this.endpoints.exit + plate, 'PATCH');
    }

    async checkPresence(plate) {
        return this.#sendRequest(this.endpoints.verify + plate, 'GET');
    }

    async updateVehicle(plate, newModel) {
        return this.#sendRequest(this.endpoints.update + plate, 'PUT', { plate, model: newModel });
    }

    async cancelRegistration(plate) {
        return this.#sendRequest(this.endpoints.cancel + plate, 'DELETE');
    }
}

// Instantiate the service
const parkingService = new ParkingService(ENDPOINTS);

// 3. Helper function to update UI messages
function updateResultMessage(elementId, message, isSuccess = true) {
    const resultElement = document.getElementById(elementId);
    resultElement.textContent = message;
    resultElement.style.color = isSuccess ? '#28a745' : '#dc3545'; // Green for success, red for error
    resultElement.style.fontWeight = 'bold';
}

// 4. Attach Event Listeners to Forms

// Register Entry Form
document.getElementById('entryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const model = document.getElementById('entryModel').value;
    const plate = document.getElementById('entryPlate').value;

    try {
        await parkingService.registerEntry(model, plate);
        updateResultMessage('entryResult', 'Entrada registrada com sucesso!', true);
    } catch (error) {
        updateResultMessage('entryResult', `Erro ao registrar entrada: ${error.message}`, false);
    }
});

// Stay Time Form
document.getElementById('timeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const plate = document.getElementById('timePlate').value;

    try {
        const data = await parkingService.getStayTime(plate);
        updateResultMessage('timeResult', `Tempo estacionado: ${data.parkedTime.toFixed(2)} minutos`, true);
    } catch (error) {
        updateResultMessage('timeResult', `Falha ao consultar tempo: ${error.message}`, false);
    }
});

// Register Exit Form
document.getElementById('exitForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const plate = document.getElementById('exitPlate').value;

    try {
        await parkingService.registerExit(plate);
        updateResultMessage('exitResult', 'Saída registrada com sucesso!', true);
    } catch (error) {
        updateResultMessage('exitResult', `Erro ao registrar saída: ${error.message}`, false);
    }
});

// Check Presence Form
document.getElementById('checkForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const plate = document.getElementById('checkPlate').value;

    try {
        const data = await parkingService.checkPresence(plate);
        const status = data.entryTime ? 'SIM' : 'NÃO';
        updateResultMessage('checkResult', `Veículo está no estacionamento? ${status}`, true);
    } catch (error) {
        updateResultMessage('checkResult', `Erro ao verificar presença: ${error.message}`, false);
    }
});

// Update Vehicle Form
document.getElementById('updateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const plate = document.getElementById('updatePlate').value;
    const newModel = document.getElementById('updateModel').value;

    try {
        await parkingService.updateVehicle(plate, newModel);
        updateResultMessage('updateResult', 'Dados atualizados com sucesso!', true);
    } catch (error) {
        updateResultMessage('updateResult', `Erro ao atualizar dados: ${error.message}`, false);
    }
});

// Cancel Registration Form
document.getElementById('cancelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const plate = document.getElementById('cancelPlate').value;

    try {
        await parkingService.cancelRegistration(plate);
        updateResultMessage('cancelResult', 'Registro removido com sucesso!', true);
    } catch (error) {
        updateResultMessage('cancelResult', `Erro ao remover registro: ${error.message}`, false);
    }
});