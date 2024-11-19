import { init, searchZendesk } from './api.mjs';
import { httpStatus, keywordParams } from './constants.mjs';
import { commonUserFields, commonTicketFields, copiedFields } from './returningFields.mjs';

const template = async (event) => {
    const { Parameters } = event.Details;
    if (!Parameters.search_template) return { status: httpStatus.badRequest };

    // populate search template with values
    const params = Object.keys(Parameters).filter((key) => !keywordParams.includes(key));
    let searchString = Parameters.search_template;
    params.forEach((key) => {
        searchString = searchString.replace(`{${key}}`, Parameters[key]);
    });

    // check for bad formatting
    if (searchString.includes('{') || searchString.includes('}')) return { status: httpStatus.badRequest };

    const webClient = await init();
    if (!webClient) return { status: httpStatus.serverError };

    let query = `/api/v2/search.json?query=${encodeURIComponent(searchString)}`;
    if (Parameters.sort_by) query += `&sort_by=${Parameters.sort_by}`;
    if (Parameters.sort_order) query += `&sort_order=${Parameters.sort_order}`;

    const { results, count } = await searchZendesk(webClient, query);
    if (!results) return { status: httpStatus.serverError };
    if (!results.length) {
        return {
            status: httpStatus.notFound,
            ...copiedFields(Parameters.carry_on, Parameters)
        };
    }
    let result = results[0];

    // hack to return the primary user for a given phone number
    // because Zendesk search api does not allow to query by shared_phone_number
    if (searchString.startsWith('type:user') && searchString.includes(' phone:')) {
        result = results.find((user) => !user.shared_phone_number);
        if (!result) {
            return {
                status: httpStatus.notFound,
                ...copiedFields(Parameters.carry_on, Parameters)
            };
        }
    }

    const response = {
        status: httpStatus.ok,
        results_count: count,
        ...copiedFields(Parameters.return_fields, result),
        ...copiedFields(Parameters.carry_on, Parameters)
    };

    if (searchString.startsWith('type:ticket')) {
        return {
            ...response,
            ...commonTicketFields(result)
        };
    }

    if (searchString.startsWith('type:user')) {
        return {
            ...response,
            ...commonUserFields(result)
        };
    }

    return response;
};

export default template; 
