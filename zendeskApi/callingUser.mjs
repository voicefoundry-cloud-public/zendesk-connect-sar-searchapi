import { httpStatus } from './constants.mjs';
import searchByTemplate from  './template.mjs';

const callingUser = async (event) => {
    const { CustomerEndpoint } = event.Details.ContactData;
    if (CustomerEndpoint.Type === 'TELEPHONE_NUMBER') {
        let phoneNo = CustomerEndpoint.Address;
        if (!phoneNo || ['private', 'unknown', 'anonymous'].includes(phoneNo)) {
            console.warn('User search aborted due to private number');
            return { status: httpStatus.notFound };
        }
        const prefix = process.env.DEFAULT_COUNTRY_PREFIX;
        if (prefix && phoneNo.startsWith(prefix))
            phoneNo = phoneNo.substring(prefix.length);

        const { Parameters } = event.Details;
        Parameters.search_template = `type:user role:end-user phone:*${phoneNo}`;
        return searchByTemplate(event);
    }

    return { status: httpStatus.notFound };
};

export default callingUser;
