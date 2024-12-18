import axios from 'axios';
import { httpStatus } from './constants.mjs';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const smClient = new SecretsManagerClient({});

const apiError = (queryUrl) => `
    error getting response from Zendesk Search API
    for query ${queryUrl}
`;    

export const init = async (email) => {
    const credentials = {
        url: process.env.ZD_URL,
        email: email || process.env.ZD_EMAIL,
        tokenId: process.env.ZD_TOKEN_ID
    };

    if (!credentials.url || !credentials.email || !credentials.tokenId) {
        console.error('missing credentials in env variables (ZD_URL, ZD_EMAIL, ZD_TOKEN_ID)');
        return null;
    }

    try {
        const command = new GetSecretValueCommand({ SecretId: credentials.tokenId });
        const secret = await smClient.send(command);

        if ('SecretString' in secret) {
            const raw = `${credentials.email}/token:${secret.SecretString}`;
            const encoded = (Buffer.from(raw)).toString('base64');
            return axios.create({
                baseURL: credentials.url,
                timeout: 5000,
                headers: { 'Authorization': 'Basic ' + encoded, 'Accept': 'application/json' }
            });
        } else {
            throw new Error("Zendesk token secret does not have a string value");
        }
    }
    catch (err) {
        console.error('Error initiating web client: ', err.message);
        return null;
    }
};

const getApiResponse = async (webClient, queryUrl) => {
    return webClient.get(queryUrl).catch((err) => {
        console.error(apiError(queryUrl));
        if (err.response) {
            // client received an error response (5xx, 4xx)
            console.error(`💥💥💥💥 response status: ${err.response.status}`);
            console.error(err.response.data);
            console.error(err.response.headers);
            return err.response.status;
        } else if (err.request) {
            console.error(`💥💥💥💥 ${err.request}`);
            return null;
        } else {
            return null;
        }
    });
};

export const searchZendesk = async (webClient, queryUrl) => {
    const response = await getApiResponse(webClient, queryUrl);
    if (!(response && response.data)) return {};

    const { data } = response;
    if (!data.results) {
        console.error('Unexpected response from Zendesk API: ', data);
        return {};
    }

    return {
        results: data.results,
        count: data.count
    };
};

export const queryZendesk = async (webClient, queryUrl, expected) => {
    const response = await getApiResponse(webClient, queryUrl);
    if (!(response && response.data)) {
        return response == '404' ? httpStatus.notFound : null;
    }

    const { data } = response;
    if (!(data[expected])) {
        console.error('Unexpected response from Zendesk API: ', data);
        return null;
    }

    return data[expected];
};
