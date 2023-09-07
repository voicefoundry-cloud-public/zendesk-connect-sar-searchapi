import { init, queryZendesk } from './api.mjs';
import { httpStatus, returnType } from './constants.mjs';
import { commonTicketFields, copiedFields } from './returningFields.mjs';

const ticketId = async (event) => {
    const { Parameters } = event.Details;
    if (!Parameters.zendesk_ticket) return { status: httpStatus.badRequest };

    const webClient = init();
    if (!webClient) return { status: httpStatus.serverError };

    const query = `/api/v2/tickets/${Parameters.zendesk_ticket}.json`;
    const ticket = await queryZendesk(webClient, query, returnType.ticket);
    if (!ticket) return { status: httpStatus.serverError };
    if (ticket === httpStatus.notFound) {
        return { 
            status: httpStatus.notFound,
            ...copiedFields(Parameters.cary_on, Parameters)
        };
    }
    
    return {
        status: httpStatus.ok,
        ...commonTicketFields(ticket),
        ...copiedFields(Parameters.cary_on, Parameters)
    };
};

export default ticketId;
